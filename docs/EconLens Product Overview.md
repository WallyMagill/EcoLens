---
title: "EconLens Product Overview and MVP Scope"
doc_type: "PRD"
stage: "All"  
version: "v0.1"
status: "Draft"
owner: "Project Owner"
last_updated: "2025-01-16"
aws_services: ["All AWS services covered in other docs"]
learning_objectives: ["Product strategy", "MVP prioritization", "User research fundamentals"]
links:
  - title: "AWS Architecture and Technical Stack"
    href: "./02-AWS-Architecture-and-Technical-Stack.md"
  - title: "Stage-by-Stage Development Plan"
    href: "./03-Stage-by-Stage-Development-Plan.md"
---

# EconLens Product Overview and MVP Scope

## Problem Statement

Individual investors lack accessible tools to stress-test their portfolios against realistic macroeconomic scenarios, limiting their ability to make informed investment decisions during uncertain times.

## Target User Personas

### Persona 1: Casual Investor (Primary Target)
**Demographics**: Ages 25-45, household income $50K-$150K, college-educated professionals
**Investment Experience**: 1-5 years, primarily using robo-advisors or simple brokerage accounts
**Technology Comfort**: High smartphone usage, comfortable with web applications
**Goals**: 
- Understand how market downturns might affect their 401k and personal investments
- Learn about portfolio diversification without paying for financial advisor
- Build confidence in investment decisions through scenario planning
**Pain Points**:
- Overwhelmed by financial news and conflicting advice
- Unsure if their portfolio can weather economic storms
- Want educational insights, not just raw data
**Jobs-to-be-Done**: "Help me understand if my investments are protected against the economic scenarios I'm worried about"

### Persona 2: Active Trader (Secondary Target)  
**Demographics**: Ages 30-55, household income $75K-$300K, some financial industry experience
**Investment Experience**: 5-15 years, actively manages substantial portfolios ($100K-$1M+)
**Technology Comfort**: Very high, uses multiple financial apps and platforms
**Goals**:
- Validate investment strategies against historical economic patterns
- Identify portfolio weak spots before market shifts occur
- Enhance decision-making with AI-powered insights
**Pain Points**:
- Existing tools are either too simplistic or require expensive Bloomberg terminals
- Time-consuming to manually research scenario impacts across asset classes
- Want quantitative analysis, not just general market commentary
**Jobs-to-be-Done**: "Give me sophisticated scenario analysis that helps me rebalance my portfolio proactively"

### Persona 3: Financial Advisor (Tertiary Target)
**Demographics**: Ages 35-60, licensed financial professionals serving 20-200+ clients
**Investment Experience**: 10+ years, managing $10M-$500M+ in client assets
**Technology Comfort**: Moderate to high, familiar with financial planning software
**Goals**:
- Demonstrate value to clients through sophisticated analysis
- Streamline portfolio review meetings with visual scenario comparisons
- Support fee justification with advanced planning tools
**Pain Points**:
- Current tools are expensive and complex for smaller practices
- Clients expect more interactive and understandable portfolio analysis
- Need to differentiate services from robo-advisors and discount brokers
**Jobs-to-be-Done**: "Help me show clients how I add value through advanced scenario planning they can understand"

## Jobs-to-be-Done Framework

### Primary Job: Portfolio Risk Assessment
**When**: Investors are concerned about economic uncertainty or major life changes
**They want to**: Understand their portfolio's vulnerability to economic shocks
**So they can**: Make informed decisions about rebalancing or risk management
**Success looks like**: Confidence in their investment strategy with specific action items

### Secondary Job: Investment Education
**When**: Investors want to improve their financial literacy and decision-making
**They want to**: Learn how economic factors affect different asset classes
**So they can**: Become more sophisticated investors over time
**Success looks like**: Better understanding of economic relationships and portfolio construction

### Tertiary Job: Decision Validation
**When**: Investors are considering major portfolio changes or new investments
**They want to**: Test their proposed changes against various economic scenarios
**So they can**: Avoid costly mistakes and optimize their strategy
**Success looks like**: Data-backed confidence in their investment decisions

## MVP Feature Matrix

### Must-Have Features (Stage 1-2)
| Feature | User Value | Technical Complexity | Business Priority |
|---------|-----------|-------------------|------------------|
| Secure user registration/login | Essential for data privacy | Medium (AWS Cognito) | Critical |
| Manual portfolio creation | Core functionality | Low | Critical |
| CSV portfolio import | Reduces friction for existing investors | Medium | High |
| 5 predefined economic scenarios | Provides immediate value | Medium | Critical |
| Basic portfolio impact calculations | Core value proposition | High | Critical |
| AI-generated scenario insights | Key differentiator | High (AWS Bedrock) | Critical |
| Save/edit/delete portfolios | Essential user management | Low | High |
| Mobile-responsive design | Modern user expectation | Medium | High |

### Should-Have Features (Stage 3-4)
| Feature | User Value | Technical Complexity | Business Priority |
|---------|-----------|-------------------|------------------|
| Advanced scenario customization | Power user engagement | High | Medium |
| Historical scenario backtesting | Validates model accuracy | High | Medium |
| Portfolio sharing capabilities | Viral growth potential | Medium | Medium |
| Performance optimization | User experience improvement | Medium | High |
| Enhanced data visualizations | Professional presentation | Medium | Medium |
| Email/SMS alerts for scenario results | User engagement | Low | Low |

### Nice-to-Have Features (Future)
| Feature | User Value | Technical Complexity | Business Priority |
|---------|-----------|-------------------|------------------|
| Real-time market data integration | Live portfolio tracking | Very High | Low |
| Social features and community scenarios | User-generated content | High | Low |
| Advanced portfolio optimization | Professional-grade analysis | Very High | Low |
| Third-party API integrations | Platform ecosystem | High | Low |
| White-label solutions | B2B revenue stream | Medium | Low |
| Mobile native applications | Enhanced user experience | High | Low |

## Success Metrics and KPIs

### Primary Success Metrics
1. **User Retention Rate**: 30% monthly active user retention within 90 days
   - Measurement: Users who return to run scenarios or manage portfolios monthly
   - Target: 30% by month 6, indicating product-market fit
   - Leading indicator: Session length and feature usage depth

2. **Scenario Analysis Completion Rate**: 80% of started scenarios completed
   - Measurement: Users who complete full scenario analysis (including AI insights)
   - Target: 80% completion rate indicating intuitive user experience
   - Leading indicator: Time spent on results page and insight engagement

3. **Portfolio Value Under Management**: $100M in analyzed portfolio value by month 12
   - Measurement: Total dollar value of portfolios created and analyzed
   - Target: $100M demonstrates meaningful user engagement
   - Leading indicator: Average portfolio size and user growth rate

### Secondary Success Metrics
- **User Acquisition Cost**: <$25 per registered user through organic and content marketing
- **Feature Adoption**: 60% of users try at least 3 different economic scenarios
- **User-Generated Content**: 40% of users save multiple portfolios for comparison
- **Net Promoter Score**: >50 based on quarterly user surveys
- **Technical Performance**: 95% uptime, <2 second page load times

## Competitive Analysis

### Direct Competitors

#### Personal Capital (now Empower)
**Strengths**: 
- Established user base (3M+ users)
- Comprehensive financial tracking
- Professional financial advisor services
**Weaknesses**:
- Limited scenario planning capabilities
- Complex interface overwhelming for casual users
- Expensive premium services ($5K+ minimum for advisory)
**Pricing**: Free basic, $5K+ for advisory services
**Differentiation**: EconLens focuses exclusively on scenario analysis with AI insights, simpler interface

#### Portfolio Visualizer
**Strengths**:
- Comprehensive backtesting capabilities
- Advanced statistical analysis
- Historical data depth
**Weaknesses**:
- Complex interface requires financial expertise
- No AI-powered insights or recommendations
- Limited mobile experience
**Pricing**: Free basic, $59-$300/year for premium features
**Differentiation**: EconLens emphasizes user-friendly AI explanations over complex statistical outputs

### Indirect Competitors

#### Robo-Advisors (Betterment, Wealthfront)
**Strengths**: Automated portfolio management, low fees, simple interfaces
**Weaknesses**: Limited educational value, no scenario planning, one-size-fits-all approach
**Market Position**: $100B+ assets under management but limited analytical tools
**Differentiation**: EconLens complements rather than replaces, focusing on education and planning

## Non-Goals (Explicit Scope Limitations)

### What EconLens Will NOT Do in MVP
1. **Financial Advice**: No specific buy/sell recommendations or personalized financial planning
2. **Real-Time Trading**: No brokerage integration or order execution capabilities
3. **Tax Optimization**: No tax-loss harvesting or tax-advantaged account analysis
4. **Alternative Investments**: Limited to stocks, bonds, and cash - no crypto, real estate, commodities
5. **Professional Financial Planning**: No retirement planning, estate planning, or insurance analysis
6. **Multi-User Collaboration**: No team accounts or financial advisor client management
7. **International Markets**: US-focused scenarios and asset classes only
8. **High-Frequency Updates**: Scenarios based on longer-term economic trends, not daily market movements

### Regulatory and Compliance Boundaries
- No SEC registration as investment advisor
- Clear disclaimers that insights are educational, not financial advice
- No storage of actual brokerage account credentials or trading capabilities
- Privacy-focused design with minimal personal financial data collection

### Technical Scope Limitations
- No integration with existing brokerage APIs for live data
- No complex derivatives or options analysis
- No real-time market data feeds (using delayed/historical data)
- No advanced portfolio optimization algorithms (mean reversion, Black-Litterman, etc.)

## Business Model and Revenue Potential

### MVP Monetization Strategy (Post-Launch)
- **Freemium Model**: 3 scenario runs per month free, unlimited access at $9.99/month
- **Premium Features**: Advanced scenarios, historical backtesting, portfolio sharing at $19.99/month
- **B2B Pilot**: Financial advisor white-label version at $99/month per advisor

### Market Opportunity Sizing
- **Total Addressable Market**: 100M+ US investors with >$10K in investments
- **Serviceable Addressable Market**: 20M+ tech-savvy investors actively managing portfolios
- **Serviceable Obtainable Market**: 100K users within 18 months (0.5% market penetration)

## Launch Strategy and Early User Acquisition

### Pre-Launch (Weeks 7-8)
- Private beta with 50 invited users from personal/professional network
- Content marketing through financial literacy blog posts and LinkedIn articles
- SEO optimization targeting "portfolio stress testing" and related keywords

### Launch Phase (Month 3-4)
- Product Hunt launch with comprehensive demo videos
- Personal finance subreddit engagement and thought leadership
- Partnership discussions with financial education platforms
- Referral program offering premium features for successful user referrals

### Growth Strategy (Months 4-12)  
- Content-driven SEO with scenario analysis case studies
- Email newsletter with monthly economic scenario updates
- Strategic partnerships with financial advisors and educators
- User-generated content through portfolio sharing and scenario competitions

---

**Document Status**: Complete - Ready for technical architecture planning
**Next Steps**: Review AWS architecture decisions and service selection in [02-AWS-Architecture-and-Technical-Stack.md](./02-AWS-Architecture-and-Technical-Stack.md)