from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

ROOT = Path(__file__).resolve().parents[2]
csv_path = ROOT / "results" / "tables" / "change_matrix_km2.csv"
output_path = ROOT / "images" / "transition_matrix_heatmap_1985_2024.png"

matrix_km2 = pd.read_csv(csv_path, index_col=0)

plt.figure(figsize=(8, 6))
sns.heatmap(
    matrix_km2,
    annot=True,
    fmt=".1f",
    cmap="YlOrRd",
    cbar_kws={"label": "Area (km²)"},
)
plt.title("Heatmap of Land Cover Change (1985 → 2024)", fontsize=14)
plt.xlabel("To (2024)")
plt.ylabel("From (1985)")
plt.xticks(rotation=45)
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig(output_path, dpi=300, bbox_inches="tight")
plt.show()

print("Heatmap saved to:", output_path)
