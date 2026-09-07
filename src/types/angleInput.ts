export type AngleInputMode = 'angle' | 'riseRun';

export interface RiseRunValues {
  rise: number | undefined;
  run: number | undefined;
}

export interface AngleInputProps {
  modelValue: number | undefined;
  label?: string;
  placeholder?: string;
  dense?: boolean;
  outlined?: boolean;
  readonly?: boolean;
  filled?: boolean;
  validation?: (val: number) => boolean | string;
  suffix?: string;
  angleReference?: 'horizontal' | 'vertical'; // For Box Calculator
}
