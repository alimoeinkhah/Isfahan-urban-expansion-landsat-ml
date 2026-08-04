from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, cohen_kappa_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

ROOT = Path(__file__).resolve().parents[2]
dataset_path = ROOT / "data" / "training" / "1985" / "training_dataset_1985.csv"
model_dir = ROOT / "models" / "1985"
metrics_dir = ROOT / "results" / "metrics"
tables_dir = ROOT / "results" / "tables"

model_dir.mkdir(parents=True, exist_ok=True)
metrics_dir.mkdir(parents=True, exist_ok=True)
tables_dir.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(dataset_path)
X = df.drop(columns=["class"])
y = df["class"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

svm = SVC(kernel="rbf", C=10, gamma="scale")
svm.fit(X_train_scaled, y_train)
y_pred_svm = svm.predict(X_test_scaled)

metrics = pd.DataFrame(
    [
        {
            "year": 1985,
            "classifier": "Random Forest",
            "overall_accuracy": accuracy_score(y_test, y_pred_rf),
            "kappa": cohen_kappa_score(y_test, y_pred_rf),
        },
        {
            "year": 1985,
            "classifier": "SVM",
            "overall_accuracy": accuracy_score(y_test, y_pred_svm),
            "kappa": cohen_kappa_score(y_test, y_pred_svm),
        },
    ]
)
metrics.to_csv(tables_dir / "model_metrics_1985.csv", index=False)

cm_rf = confusion_matrix(y_test, y_pred_rf)
cm_svm = confusion_matrix(y_test, y_pred_svm)

print(metrics.to_string(index=False))
print("\nRandom Forest confusion matrix:\n", cm_rf)
print("\nSVM confusion matrix:\n", cm_svm)

figure, axes = plt.subplots(1, 2, figsize=(12, 5))
sns.heatmap(cm_rf, annot=True, cmap="Blues", fmt="g", ax=axes[0])
axes[0].set_title("Confusion Matrix - Random Forest")
axes[0].set_xlabel("Predicted")
axes[0].set_ylabel("Actual")

sns.heatmap(cm_svm, annot=True, cmap="Greens", fmt="g", ax=axes[1])
axes[1].set_title("Confusion Matrix - SVM")
axes[1].set_xlabel("Predicted")
axes[1].set_ylabel("Actual")

figure.tight_layout()
figure.savefig(metrics_dir / "confusion_matrices_1985.png", dpi=300, bbox_inches="tight")
plt.show()

joblib.dump(svm, model_dir / "svm_model.pkl")
joblib.dump(scaler, model_dir / "svm_scaler.pkl")
joblib.dump(rf, model_dir / "rf_model.pkl")

print("Models saved in:", model_dir)
