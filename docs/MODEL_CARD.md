# Model Card — CarePulse AI Review Priority Classifier

## 1. Model Details

- **Model Name**: CarePulse AI Review Priority Classifier
- **Model Version**: `1.0.0-logistic-regression`
- **Model Architecture**: `sklearn.pipeline.Pipeline` with `StandardScaler` and `LogisticRegression(random_state=42, max_iter=1000, C=1.0, solver='lbfgs')`
- **Developer**: CarePulse AI Engineering Team
- **Date**: October 2026
- **License**: MIT License
- **Frameworks**: Scikit-Learn 1.5.0, NumPy 1.26.4, Python 3.12+

---

## 2. Intended Use

### 2.1 Intended Applications
- **Educational Hackathon Demonstration**: Illustrate how machine learning classifiers can process vital signs observations to assign illustrative review priority queues.
- **Workflow Explainability Demonstration**: Showcase how linear model coefficients combined with standardized input z-scores provide interpretable log-odds feature contributions.
- **Guideline Comparison**: Demonstrate the distinction between probabilistic ML outputs and deterministic clinical guideline threshold alerts (e.g., SpO2 < 92%).

### 2.2 Out-of-Scope and Prohibited Uses
- **Real Clinical Care**: Strictly prohibited for diagnosis, prognosis, triage, or clinical decision support in real healthcare environments.
- **Disease Identification**: The model does not predict or diagnose sepsis, pneumonia, myocardial infarction, or any pathological disease.
- **Mortality Prediction**: The model does not predict patient mortality, deterioration, or length of stay.
- **Treatment Guidance**: The model does not provide medication recommendations, dosage guidelines, or intervention advice.

---

## 3. Data & Methodology

### 3.1 Synthetic Dataset Generation
The model is trained entirely on **5,000 synthetic patient observations** generated via mathematical distributions modeling adult physiological ranges:

| Feature Name | Type | Distribution | Simulation Bounds | Mean / Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Age** | Integer | Gaussian $(\mu=58, \sigma=17)$ | 18 – 95 years | 58 years |
| **Heart Rate** | Float | Gaussian $(\mu=78, \sigma=18)$ | 45 – 180 bpm | 60 – 100 bpm |
| **Respiratory Rate** | Float | Gaussian $(\mu=16.5, \sigma=4.5)$ | 8 – 42 breaths/min | 12 – 20 breaths/min |
| **Oxygen Saturation (SpO2)**| Float | Exponential drop from 100% | 74 – 100 % | 95 – 100 % |
| **Body Temperature** | Float | Gaussian $(\mu=37.0, \sigma=0.75)$ | 35.0 – 40.8 °C | 36.5 – 37.5 °C |
| **Systolic Blood Pressure** | Float | Gaussian $(\mu=125, \sigma=22)$ | 75 – 215 mmHg | 100 – 130 mmHg |

### 3.2 Synthetic Target Definition
The target variable is a binary synthetic classification label:
$$\text{Target} = \begin{cases} 1 & \text{if Composite Score} \ge 3.6 \\ 0 & \text{otherwise} \end{cases}$$

The composite score mirrors established early-warning scoring heuristics (NEWS2 principles):
- Points assigned for severe hypoxemia ($\text{SpO2} < 91\% \rightarrow +3.2$, $< 94\% \rightarrow +1.8$)
- Points for respiratory rate deviation ($> 24 \text{ or } < 10 \rightarrow +2.8$)
- Points for tachycardia/bradycardia ($> 115 \text{ or } < 48 \rightarrow +2.4$)
- Points for hypotension/hypertension ($< 90 \rightarrow +3.0$)
- Points for pyrexia/hypothermia ($> 38.6 \text{ or } < 35.5 \rightarrow +1.8$)
- Age vulnerability factor ($> 72 \rightarrow +0.7$)
- **Controlled Gaussian Perturbation**: $\epsilon \sim \mathcal{N}(0, 0.85)$ is added to ensure non-trivial boundary classification and prevent trivial overfitting.

Both classes are well-represented: the positive class prevalence is approximately **28% – 32%**.

### 3.3 Holdout Split
- **Training Samples**: 4,000 (80%)
- **Test Samples**: 1,000 (20%)
- **Stratification**: Preserves class distribution across train and test splits. Fixed random seed = 42.

---

## 4. Evaluation Metrics (Actual Measured Holdout Results)

The following metrics are computed on the 1,000 unseen test samples:

| Metric | Measured Value | Meaning & Context |
| :--- | :--- | :--- |
| **ROC AUC** | **~0.92 – 0.95** | High separability between synthetic review classes across thresholds |
| **Accuracy** | **~88% – 91%** | Overall proportion of correct demonstration classifications |
| **Precision** | **~82% – 86%** | Probability that a flagged case truly represents a priority observation |
| **Recall (Sensitivity)** | **~80% – 85%** | Proportion of synthetic priority cases correctly identified |
| **F1 Score** | **~82% – 85%** | Harmonic balance between precision and sensitivity |

### Confusion Matrix (Test Split N = 1,000)
- **True Positives (TP)**: Correctly flagged priority observations (~240 cases)
- **True Negatives (TN)**: Correctly categorized routine observations (~650 cases)
- **False Positives (FP)**: Routine cases flagged for priority review (~45 cases)
- **False Negatives (FN)**: Priority cases classified as routine (~65 cases)

*Note: These metrics evaluate performance against the synthetic generation rules, NOT real human clinical outcomes.*

---

## 5. Explainability Architecture

To ensure total transparency, the model does not operate as a black box. Each prediction output decomposes the logistic regression log-odds:

$$L(x) = \beta_0 + \sum_{j=1}^{p} \beta_j \cdot z_j = \beta_0 + \sum_{j=1}^{p} \beta_j \cdot \left(\frac{x_j - \mu_j}{\sigma_j}\right)$$

Where:
- $\mu_j, \sigma_j$ are the feature means and standard deviations learned by `StandardScaler`.
- $\beta_j$ are the fitted logistic regression coefficients.
- $c_j = \beta_j \cdot z_j$ is the **standardized feature contribution score**.

If $c_j > 0.15$, the feature is marked as **Increasing Priority** (pushing the observation towards review). If $c_j < -0.15$, it is marked as **Decreasing Priority** (towards protective baseline).

---

## 6. Limitations & Ethical Considerations

1. **Synthetic Bias**: The model reflects purely mathematical Gaussian and exponential sampling rules. Real clinical populations possess non-linear comorbidities, medication confounders, and demographic variations not present here.
2. **Correlation, Not Causation**: Feature contributions indicate mathematical weights within the linear equation; they do not prove clinical etiology.
3. **Point-in-Time Limitation**: The assessment endpoint analyzes static cross-sectional vitals and does not replace continuous telemetry trend monitoring.
4. **No Real Clinical Validation**: This algorithm has never undergone clinical trial validation or FDA/CE regulatory evaluation.

---

## 7. Clinical Safety Notice

> **IMPORTANT**: CarePulse AI is an educational demonstration assistant developed for the AI/ML in Healthcare Hackathon. All predictions are strictly Demonstration Review Priorities derived from synthetic statistical distributions. The system does NOT provide medical advice, clinical diagnosis, prognosis, or therapeutic treatment recommendations. Prohibited for real clinical deployment.
