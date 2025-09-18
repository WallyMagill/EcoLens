import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';

const assetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
});

const portfolioAssetsSchema = z.object({
  assets: z.array(assetSchema).min(1, 'At least one asset is required'),
});

type AssetFormData = z.infer<typeof portfolioAssetsSchema>;

interface AssetInputProps {
  initialAssets?: Array<{
    symbol: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  onSubmit: (assets: AssetFormData['assets']) => void;
  onCancel: () => void;
  loading?: boolean;
}

const AssetInput: React.FC<AssetInputProps> = ({
  initialAssets = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(portfolioAssetsSchema),
    defaultValues: {
      assets: initialAssets.length > 0 ? initialAssets : [
        { symbol: '', name: '', quantity: 0, price: 0 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'assets',
  });

  const watchedAssets = watch('assets');
  const totalValue = watchedAssets.reduce((sum, asset) => {
    return sum + (asset.quantity * asset.price);
  }, 0);

  const addAsset = () => {
    append({ symbol: '', name: '', quantity: 0, price: 0 });
  };

  const removeAsset = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleFormSubmit = (data: AssetFormData) => {
    onSubmit(data.assets);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio Assets</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Total Value: <span className="font-semibold">${totalValue.toFixed(2)}</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addAsset}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Asset
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Asset {index + 1}</h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symbol *
                </label>
                <input
                  {...register(`assets.${index}.symbol`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AAPL"
                />
                {errors.assets?.[index]?.symbol && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.assets[index]?.symbol?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  {...register(`assets.${index}.name`)}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Apple Inc."
                />
                {errors.assets?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.assets[index]?.name?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  {...register(`assets.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
                {errors.assets?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.assets[index]?.quantity?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  {...register(`assets.${index}.price`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="150.00"
                />
                {errors.assets?.[index]?.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.assets[index]?.price?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>
                  Value: ${(watchedAssets[index]?.quantity * watchedAssets[index]?.price || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>
                  Allocation: {totalValue > 0 ? ((watchedAssets[index]?.quantity * watchedAssets[index]?.price / totalValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Save Assets
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssetInput;
