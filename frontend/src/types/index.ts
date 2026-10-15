export type DemonstrationCategory =
  | "Routine demonstration review"
  | "Review suggested by demonstration model"
  | "Higher demonstration review priority";

export interface VitalSigns {
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  body_temperature: number;
  systolic_blood_pressure: number;
}

export interface ObservationEntry {
  timestamp: string;
  vital_signs: VitalSigns;
  notes?: string;
  demonstration_score: number;
}

export interface PatientRecord {
  id: string;
  display_code: string;
  age: number;
  biological_sex: string;
  unit: string;
  admission_timestamp: string;
  current_vital_signs: VitalSigns;
  observation_history: ObservationEntry[];
  demonstration_category: DemonstrationCategory;
  review_priority_score: number;
  illustrative_flags: string[];
  last_updated: string;
}

export interface PatientSummary {
  id: string;
  display_code: string;
  age: number;
  biological_sex: string;
  unit: string;
  current_vital_signs: VitalSigns;
  demonstration_category: DemonstrationCategory;
  review_priority_score: number;
  illustrative_flags: string[];
  last_updated: string;
}

export interface DashboardSummary {
  total_patients: number;
  routine_count: number;
  review_suggested_count: number;
  higher_priority_count: number;
  active_alerts_count: number;
  average_vitals: Record<string, number>;
  recent_events: Array<{
    timestamp: string;
    patient_id: string;
    event_type: string;
    summary: string;
  }>;
  disclaimer: string;
  timestamp: string;
}

export interface FeatureContribution {
  feature_name: string;
  display_name: string;
  raw_value: number;
  unit: string;
  scaled_value: number;
  coefficient: number;
  contribution_score: number;
  direction: "increases_priority" | "decreases_priority" | "neutral";
  human_explanation: string;
}

export interface ThresholdFlag {
  metric_name: string;
  value: number;
  threshold_rule: string;
  severity: "routine" | "caution" | "concerning";
  message: string;
}

export interface AssessmentRequest {
  age: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  body_temperature: number;
  systolic_blood_pressure: number;
}

export interface AssessmentResponse {
  assessment_id: string;
  demonstration_score: number;
  demonstration_category: DemonstrationCategory;
  model_version: string;
  input_summary: Record<string, number>;
  feature_contributions: FeatureContribution[];
  threshold_flags: ThresholdFlag[];
  score_interpretation: string;
  safety_disclaimer: string;
  timestamp: string;
}

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  test_sample_size: number;
  train_sample_size: number;
  class_distribution_positive_pct: number;
}

export interface ModelCardResponse {
  model_name: string;
  model_version: string;
  model_architecture: string;
  pipeline_components: string[];
  input_features: Array<{
    feature_name: string;
    display_name: string;
    unit: string;
    reference_range: string;
  }>;
  target_definition: string;
  synthetic_generation_methodology: string;
  training_procedure: string;
  evaluation_metrics: EvaluationMetrics;
  feature_coefficients: Record<string, number>;
  intercept: number;
  limitations: string[];
  clinical_safety_notice: string;
  last_trained_timestamp: string;
}

export interface HealthResponse {
  status: string;
  app_name: string;
  app_version: string;
  demonstration_mode: boolean;
  synthetic_data_only: boolean;
  model_initialized: boolean;
  model_version: string;
  timestamp: string;
}
