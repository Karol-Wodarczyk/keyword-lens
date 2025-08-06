import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const hours = value ? value.getHours() : 0;
  const minutes = value ? value.getMinutes() : 0;
  const seconds = value ? value.getSeconds() : 0;

  const handleTimeChange = (field: 'hours' | 'minutes' | 'seconds', newValue: string) => {
    if (!value) return;
    
    const newDate = new Date(value);
    const numValue = parseInt(newValue, 10);
    
    switch (field) {
      case 'hours':
        newDate.setHours(numValue);
        break;
      case 'minutes':
        newDate.setMinutes(numValue);
        break;
      case 'seconds':
        newDate.setSeconds(numValue);
        break;
    }
    
    onChange(newDate);
  };

  const formatValue = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Hours */}
      <div className="flex-1">
        <Select
          value={formatValue(hours)}
          onValueChange={(value) => handleTimeChange('hours', value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => (
              <SelectItem key={i} value={formatValue(i)}>
                {formatValue(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <span className="text-muted-foreground text-sm">:</span>
      
      {/* Minutes */}
      <div className="flex-1">
        <Select
          value={formatValue(minutes)}
          onValueChange={(value) => handleTimeChange('minutes', value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (_, i) => (
              <SelectItem key={i} value={formatValue(i)}>
                {formatValue(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <span className="text-muted-foreground text-sm">:</span>
      
      {/* Seconds */}
      <div className="flex-1">
        <Select
          value={formatValue(seconds)}
          onValueChange={(value) => handleTimeChange('seconds', value)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="SS" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (_, i) => (
              <SelectItem key={i} value={formatValue(i)}>
                {formatValue(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};