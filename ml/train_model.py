import pickle
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor

# =========================
# LOAD DATA
# =========================
df = pd.read_csv("dataset.csv")

# =========================
# RENAME COLUMN (if needed)
# =========================
df = df[[
    "sleep_duration_hours",
    "work",
    "mood",
    "screen_time_hours",
    "workout_minutes",
    "spo2_avg_pct",
    "resting_hr_bpm",
    "stress_score"
]]

df = df.rename(columns={
    "sleep_duration_hours": "sleep",
    "work": "work",
    "mood": "mood",
    "screen_time_hours": "screen",
    "workout_minutes": "activity",
    "resting_hr_bpm": "hr",
    "spo2_avg_pct": "spo2",
    "stress_score": "stress"
})

# =========================
# ENCODE MOOD (IMPORTANT)
# =========================
mood_map = {
    "very_bad": 0,
    "bad": 1,
    "neutral": 2,
    "good": 3,
    "very_good": 4
}
df["mood"] = df["mood"].map(mood_map)

# Handle missing values (after encoding)
df.info()

# Check skewness for numeric columns
numeric_cols = ['sleep', 'work', 'screen', 'activity', 'hr', 'spo2', 'stress']
for col in numeric_cols:
    skewness = df[col].skew()
    print(f"{col}: skewness = {skewness:.2f}")

import matplotlib.pyplot as plt

for col in ['sleep', 'work']:
    plt.hist(df[col].dropna(), bins=30, edgecolor='k')
    plt.title(f'Distribution of {col}')
    plt.xlabel(col)
    plt.ylabel('Frequency')
    plt.show()

# Fill 'sleep' with mean
df['sleep'].fillna(df['sleep'].mean(), inplace=True)

# Fill 'work' with median
df['work'].fillna(df['work'].median(), inplace=True)

# Verify that no nulls remain
print(df[['sleep', 'work']].isnull().sum())

null_counts = df.isnull().sum()
print("Null values per column:\n", null_counts)

# Total rows with any null values
total_null_rows = df.isnull().any(axis=1).sum()
print("Total rows with any null values:", total_null_rows)


# =========================
# FEATURES & TARGET
# =========================
X = df[["sleep", "work", "mood", "screen", "activity", "hr", "spo2"]]
y = df["stress"]

print(df.head())

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# SCALING (needed for some models)
# =========================
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# =========================
# MODELS
# =========================
models = {
    "Linear Regression": LinearRegression(),
    "Decision Tree": DecisionTreeRegressor(max_depth=10),
    "Random Forest": RandomForestRegressor(n_estimators=200, random_state=42),
    "Gradient Boosting": GradientBoostingRegressor(),
    "SVR": SVR(),
    "KNN": KNeighborsRegressor()
}

# =========================
# TRAIN & EVALUATE
# =========================
results = {}

for name, model in models.items():
    
    # Use scaled data for some models
    if name in ["Linear Regression", "SVR", "KNN"]:
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
    else:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
    
    r2 = r2_score(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    
    results[name] = (r2, mse)
    
    print(f"{name}")
    print(f"R2 Score: {r2:.4f}")
    print(f"MSE: {mse:.4f}")
    print("-" * 40)

# =========================
# BEST MODEL
# =========================
best_model_name = max(results, key=lambda x: results[x][0])
print(f"\nBest Model: {best_model_name}")

# =========================
# SAVE BEST MODEL
# =========================
best_model = models[best_model_name]

with open("stress_model.pkl", "wb") as f:
    pickle.dump(best_model, f)

print("Best model saved → stress_model.pkl")