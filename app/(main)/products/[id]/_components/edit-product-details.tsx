"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Specification = {
  key: string;
  value: string;
};

interface EditProductDetailsProps {
  initialDescription: string;
  initialSpecifications: Record<string, string>;
  onSave: (data: { description: string; specifications: Record<string, string> }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditProductDetails({
  initialDescription,
  initialSpecifications,
  onSave,
  onCancel,
  isLoading,
}: EditProductDetailsProps) {
  const [description, setDescription] = useState(initialDescription);
  const [specifications, setSpecifications] = useState<Specification[]>(
    Object.entries(initialSpecifications).map(([key, value]) => ({
      key,
      value: String(value),
    })) || []
  );

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs.length > 0 ? newSpecs : [{ key: "", value: "" }]);
  };

  const updateSpecification = (index: number, field: keyof Specification, value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecifications(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert specifications array to object
    const specsObj = specifications.reduce((acc, { key, value }) => {
      if (key.trim() && value.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    await onSave({
      description,
      specifications: specsObj,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px]"
          placeholder="Enter product description"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Specifications
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSpecification}
            className="h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 md:mr-1.5" />
           <span className="hidden md:inline">Add Specification</span>
          </Button>
        </div>

        <div className="space-y-3">
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  placeholder="Key"
                  value={spec.key}
                  onChange={(e) =>
                    updateSpecification(index, "key", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) =>
                    updateSpecification(index, "value", e.target.value)
                  }
                  className="h-9"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive"
                onClick={() => removeSpecification(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
