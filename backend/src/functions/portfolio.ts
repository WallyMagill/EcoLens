import { Portfolio } from '@econlens/shared';
import express, { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { getDatabaseClient } from '../database/connection';
import { logger } from '../shared/utils/logger';
import { authenticateToken } from '../shared/middleware/auth';

const router = express.Router();

// GET /api/portfolios - List all portfolios (requires authentication)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await getDatabaseClient();
    
    const userId = req.user!.userId; // Get authenticated user ID from JWT token
    
    // Get portfolios with asset counts and calculated total values
    const result = await client.query(`
      SELECT p.*, 
             COUNT(pa.id)::integer as asset_count,
             COALESCE(SUM(pa.dollar_amount), 0) as calculated_total_value
      FROM portfolios p 
      LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id 
      WHERE p.user_id = $1 
      GROUP BY p.id 
      ORDER BY p.created_at DESC
    `, [userId]);
    
    const portfolios = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      totalValue: parseFloat(row.total_value),
      currency: row.currency,
      lastAnalyzedAt: row.last_analyzed_at,
      analysisCount: row.analysis_count,
      isPublic: row.is_public,
      shareToken: row.share_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      assetCount: row.asset_count,
      calculatedTotalValue: parseFloat(row.calculated_total_value),
      // Default risk profile - will be calculated in future iterations
      riskProfile: {
        overallRiskScore: 5.0,
        concentrationRisk: 5.0,
        sectorConcentration: 0,
        geographicRisk: 0,
        volatilityScore: 5.0,
        creditRisk: 3.0,
      }
    }));

    res.json({
      success: true,
      data: portfolios,
      message: 'Portfolios retrieved successfully',
    });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve portfolios',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// GET /api/portfolios/:id - Get portfolio by ID (requires authentication)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    client = await getDatabaseClient();
    const { id } = req.params;
    const userId = req.user!.userId; // Get authenticated user ID from JWT token

    // Get portfolio details
    const portfolioResult = await client.query(`
      SELECT * FROM portfolios 
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio with ID ${id} not found`,
      });
    }

    const portfolioRow = portfolioResult.rows[0];

    // Get portfolio assets
    const assetsResult = await client.query(`
      SELECT * FROM portfolio_assets 
      WHERE portfolio_id = $1 
      ORDER BY symbol
    `, [id]);

    const assets = assetsResult.rows.map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.asset_type,
      assetCategory: asset.asset_category,
      sector: asset.sector,
      geographicRegion: asset.geographic_region,
      allocationPercentage: parseFloat(asset.allocation_percentage),
      dollarAmount: parseFloat(asset.dollar_amount),
      shares: asset.shares ? parseFloat(asset.shares) : undefined,
      avgPurchasePrice: asset.avg_purchase_price ? parseFloat(asset.avg_purchase_price) : undefined,
      riskRating: asset.risk_rating,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    }));

    const portfolio: Portfolio = {
      id: portfolioRow.id,
      userId: portfolioRow.user_id,
      name: portfolioRow.name,
      description: portfolioRow.description,
      totalValue: parseFloat(portfolioRow.total_value),
      currency: portfolioRow.currency,
      assets: assets,
      lastAnalyzedAt: portfolioRow.last_analyzed_at,
      analysisCount: portfolioRow.analysis_count,
      isPublic: portfolioRow.is_public,
      shareToken: portfolioRow.share_token,
      createdAt: portfolioRow.created_at,
      updatedAt: portfolioRow.updated_at,
      // Default risk profile - will be calculated in future iterations
      riskProfile: {
        overallRiskScore: 5.0,
        concentrationRisk: 5.0,
        sectorConcentration: 0,
        geographicRisk: 0,
        volatilityScore: 5.0,
        creditRisk: 3.0,
      }
    };

    res.json({
      success: true,
      data: portfolio,
      message: 'Portfolio retrieved successfully',
    });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to retrieve portfolio',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// POST /api/portfolios - Create new portfolio (requires authentication)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    const portfolioData = req.body;

    // Basic validation
    if (!portfolioData.name || !portfolioData.assets) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Name and assets are required',
      });
    }

    // Validate allocation percentages sum to 100%
    const totalAllocation = portfolioData.assets.reduce((sum: number, asset: any) => 
      sum + (asset.allocationPercentage || 0), 0);
    
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Allocation percentages must sum to 100%. Current sum: ${totalAllocation}%`,
      });
    }

    client = await getDatabaseClient();
    const userId = req.user!.userId; // Get authenticated user ID from JWT token
    const portfolioId = Math.random().toString(36).substr(2, 9);

    // Start transaction
    await client.query('BEGIN');

    try {
      // Insert portfolio
      const portfolioResult = await client.query(`
        INSERT INTO portfolios (id, user_id, name, description, total_value, currency) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `, [
        portfolioId,
        userId,
        portfolioData.name,
        portfolioData.description || null,
        portfolioData.totalValue || 0,
        'USD'
      ]);

      const portfolioRow = portfolioResult.rows[0];

      // Insert assets
      const assetPromises = portfolioData.assets.map((asset: any, index: number) => {
        const assetId = `${portfolioId}_asset_${index}`;
        return client!.query(`
          INSERT INTO portfolio_assets (
            id, portfolio_id, symbol, name, asset_type, asset_category, 
            sector, geographic_region, allocation_percentage, dollar_amount, 
            shares, avg_purchase_price, risk_rating
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          assetId,
          portfolioId,
          asset.symbol,
          asset.name,
          asset.assetType || 'stock',
          asset.assetCategory || null,
          asset.sector || null,
          asset.geographicRegion || null,
          asset.allocationPercentage,
          asset.dollarAmount,
          asset.shares || null,
          asset.avgPurchasePrice || null,
          asset.riskRating || 5
        ]);
      });

      await Promise.all(assetPromises);

      // Commit transaction
      await client.query('COMMIT');

      // Get the created portfolio with assets
      const createdPortfolio = await client.query(`
        SELECT p.*, 
               json_agg(
                 json_build_object(
                   'id', pa.id,
                   'symbol', pa.symbol,
                   'name', pa.name,
                   'assetType', pa.asset_type,
                   'assetCategory', pa.asset_category,
                   'sector', pa.sector,
                   'geographicRegion', pa.geographic_region,
                   'allocationPercentage', pa.allocation_percentage,
                   'dollarAmount', pa.dollar_amount,
                   'shares', pa.shares,
                   'avgPurchasePrice', pa.avg_purchase_price,
                   'riskRating', pa.risk_rating,
                   'createdAt', pa.created_at,
                   'updatedAt', pa.updated_at
                 )
               ) FILTER (WHERE pa.id IS NOT NULL) as assets
        FROM portfolios p
        LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [portfolioId]);

      const portfolio = createdPortfolio.rows[0];
      
      const newPortfolio: Portfolio = {
        id: portfolio.id,
        userId: portfolio.user_id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: parseFloat(portfolio.total_value),
        currency: portfolio.currency,
        assets: portfolio.assets || [],
        lastAnalyzedAt: portfolio.last_analyzed_at,
        analysisCount: portfolio.analysis_count,
        isPublic: portfolio.is_public,
        shareToken: portfolio.share_token,
        createdAt: portfolio.created_at,
        updatedAt: portfolio.updated_at,
        riskProfile: {
          overallRiskScore: 5.0,
          concentrationRisk: 5.0,
          sectorConcentration: 0,
          geographicRisk: 0,
          volatilityScore: 5.0,
          creditRisk: 3.0,
        }
      };

      logger.info('Portfolio created successfully:', newPortfolio.name);

      res.status(201).json({
        success: true,
        data: newPortfolio,
        message: 'Portfolio created successfully',
      });

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to create portfolio',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// PUT /api/portfolios/:id - Update portfolio (requires authentication)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    const { id } = req.params;
    const portfolioData = req.body;
    const userId = req.user!.userId; // Get authenticated user ID from JWT token

    // Basic validation
    if (!portfolioData.name) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Portfolio name is required',
      });
    }

    // Validate allocation percentages if assets are provided
    if (portfolioData.assets) {
      const totalAllocation = portfolioData.assets.reduce((sum: number, asset: any) => 
        sum + (asset.allocationPercentage || 0), 0);
      
      if (Math.abs(totalAllocation - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          message: `Allocation percentages must sum to 100%. Current sum: ${totalAllocation}%`,
        });
      }
    }

    client = await getDatabaseClient();

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await client.query(`
      SELECT id FROM portfolios WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (existingPortfolio.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio with ID ${id} not found`,
      });
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Update portfolio
      const portfolioResult = await client.query(`
        UPDATE portfolios 
        SET name = $1, description = $2, total_value = $3, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $4 AND user_id = $5 
        RETURNING *
      `, [
        portfolioData.name,
        portfolioData.description || null,
        portfolioData.totalValue || 0,
        id,
        userId
      ]);

      // If assets are provided, update them
      if (portfolioData.assets) {
        // Delete existing assets
        await client.query(`
          DELETE FROM portfolio_assets WHERE portfolio_id = $1
        `, [id]);

        // Insert new assets
        const assetPromises = portfolioData.assets.map((asset: any, index: number) => {
          const assetId = `${id}_asset_${index}`;
          return client!.query(`
            INSERT INTO portfolio_assets (
              id, portfolio_id, symbol, name, asset_type, asset_category, 
              sector, geographic_region, allocation_percentage, dollar_amount, 
              shares, avg_purchase_price, risk_rating
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            assetId,
            id,
            asset.symbol,
            asset.name,
            asset.assetType || 'stock',
            asset.assetCategory || null,
            asset.sector || null,
            asset.geographicRegion || null,
            asset.allocationPercentage,
            asset.dollarAmount,
            asset.shares || null,
            asset.avgPurchasePrice || null,
            asset.riskRating || 5
          ]);
        });

        await Promise.all(assetPromises);
      }

      // Commit transaction
      await client.query('COMMIT');

      // Get the updated portfolio with assets
      const updatedPortfolio = await client.query(`
        SELECT p.*, 
               json_agg(
                 json_build_object(
                   'id', pa.id,
                   'symbol', pa.symbol,
                   'name', pa.name,
                   'assetType', pa.asset_type,
                   'assetCategory', pa.asset_category,
                   'sector', pa.sector,
                   'geographicRegion', pa.geographic_region,
                   'allocationPercentage', pa.allocation_percentage,
                   'dollarAmount', pa.dollar_amount,
                   'shares', pa.shares,
                   'avgPurchasePrice', pa.avg_purchase_price,
                   'riskRating', pa.risk_rating,
                   'createdAt', pa.created_at,
                   'updatedAt', pa.updated_at
                 )
               ) FILTER (WHERE pa.id IS NOT NULL) as assets
        FROM portfolios p
        LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id]);

      const portfolio = updatedPortfolio.rows[0];
      
      const updatedPortfolioData: Portfolio = {
        id: portfolio.id,
        userId: portfolio.user_id,
        name: portfolio.name,
        description: portfolio.description,
        totalValue: parseFloat(portfolio.total_value),
        currency: portfolio.currency,
        assets: portfolio.assets || [],
        lastAnalyzedAt: portfolio.last_analyzed_at,
        analysisCount: portfolio.analysis_count,
        isPublic: portfolio.is_public,
        shareToken: portfolio.share_token,
        createdAt: portfolio.created_at,
        updatedAt: portfolio.updated_at,
        riskProfile: {
          overallRiskScore: 5.0,
          concentrationRisk: 5.0,
          sectorConcentration: 0,
          geographicRisk: 0,
          volatilityScore: 5.0,
          creditRisk: 3.0,
        }
      };

      logger.info('Portfolio updated successfully:', id);

      res.json({
        success: true,
        data: updatedPortfolioData,
        message: 'Portfolio updated successfully',
      });

    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to update portfolio',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// DELETE /api/portfolios/:id - Delete portfolio (requires authentication)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  let client: PoolClient | undefined;
  try {
    const { id } = req.params;
    const userId = req.user!.userId; // Get authenticated user ID from JWT token

    client = await getDatabaseClient();

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await client.query(`
      SELECT id, name FROM portfolios WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (existingPortfolio.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio with ID ${id} not found`,
      });
    }

    const portfolioName = existingPortfolio.rows[0].name;

    // Delete portfolio (portfolio_assets will be cascade deleted automatically)
    const result = await client.query(`
      DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING *
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found',
        message: `Portfolio with ID ${id} not found`,
      });
    }

    logger.info('Portfolio deleted successfully:', portfolioName);

    res.json({
      success: true,
      message: 'Portfolio deleted successfully',
    });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Failed to delete portfolio',
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

export { router as portfolioRouter };
