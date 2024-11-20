from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
import pandas as pd
import pickle
import matplotlib.pyplot as plt

# Load the dataset
data_path = 'new data.xlsx'
data = pd.read_excel(data_path)

# Filtering out the unwanted records
data = data[~((data['transaction_ratio'] >= 0.90) & (data['isFraud'] == 1))]
data = data[~((data['transaction_ratio'] < 0.90) & (data['isFraud'] == 0))]

data['is_high_ratio'] = ((data['transaction_ratio'] >= 0.90) & (data['transaction_ratio'] <= 1)).astype(int)


# Dropping unnecessary columns
data = data.drop(['step', 'nameOrig', 'nameDest', 'isFlaggedFraud'], axis=1)


# Display the updated DataFrame
print(data[['transaction_ratio', 'is_high_ratio']].head())

# Encoding categorical data
label_encoder = LabelEncoder()
data['type'] = label_encoder.fit_transform(data['type'])

# Splitting the dataset into features and target
X = data.drop(['isFraud'], axis=1)
y = data['isFraud']

# Splitting the data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scaling features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Handling class imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)

# Save scaler and label encoder
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
with open('type_encoder.pkl', 'wb') as f:
    pickle.dump(label_encoder, f)

# Train RandomForestClassifier
model = RandomForestClassifier(n_estimators=50, random_state=42, class_weight='balanced')
model.fit(X_train_resampled, y_train_resampled)

# Evaluate the model
accuracy = model.score(X_test_scaled, y_test)
print(f'Model accuracy: {accuracy:.2%}')

# Save the model if accuracy meets the threshold
if accuracy >= 0.90:
    with open('fraud_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model trained successfully and saved.")
else:
    print("Model did not meet the accuracy requirement.")

# # Feature importance
# feature_importances = model.feature_importances_
# features = X.columns
# plt.barh(features, feature_importances)
# plt.xlabel('Importance')
# plt.title('Feature Importance')
# plt.show()
