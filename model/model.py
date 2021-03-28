import os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn import preprocessing
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
import json

# reading and cleaning up the data
data = pd.read_csv(os.path.join(os.path.dirname(__file__), "../model/data.csv"))
data = data[data['release_date'] >= '2000']
data = data.sample(5000)

# keep only some features, song id, song name, and song artist
songs = data.drop(['duration_ms','explicit','popularity','release_date','year','key','mode','instrumentalness'], axis=1)

# scale loudness and tempo to range from 0 to 1
# loudness = songs[['loudness']].values
# min_max_scaler = preprocessing.MinMaxScaler()
# loudness_scaled = min_max_scaler.fit_transform(loudness)
# songs['loudness'] = pd.DataFrame(loudness_scaled)

# tempo = songs[['tempo']].values
# min_max_scaler = preprocessing.MinMaxScaler()
# tempo_scaled = min_max_scaler.fit_transform(tempo)
# songs['tempo'] = pd.DataFrame(tempo_scaled)

# drop song id, name, and artist (any any infinity and NaN values)
features = songs.copy()
features = features.drop(['id','name','artists'],axis=1)
features = features.dropna()

# by elbow curve, optimal clusters = 4
kmeans = KMeans(n_clusters=4)
kmeans.fit(features)

# dimensional reduction to reduce all columns to 2
y_kmeans = kmeans.predict(features)
pca = PCA(n_components=2)
principal_components = pca.fit_transform(features)

# label each song by cluster they belong to
songs['label'] = y_kmeans

X = features
y = y_kmeans

# split dataset into two to train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33)

# using KNN to classify
knn = KNeighborsClassifier(n_neighbors=3)
# Train the model using the training sets
# knn.fit(X_train,y_train)
knn.fit(X, y)

knn_pred = knn.predict(X_test)


def prediction(song_info):
    write_to_csv(song_info)
    song_info_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "song_features.csv"))
    pred = knn.predict(song_info_df)
    pred_df = pd.DataFrame(pred)
    return pred_df.to_json()


def write_to_csv(songs):
    features = ["acousticness", "danceability", "energy","liveness", "loudness", "speechiness", "tempo", "valence"]
    columnDelimiter = ','
    lineDelimiter = '\n'
    result = ''
    
    result += columnDelimiter.join(features) + lineDelimiter

    for song in songs:
        result += columnDelimiter.join([str(song[feature]) for feature in features]) + lineDelimiter
    
    with open(os.path.join(os.path.dirname(__file__), "song_features.csv"), 'w') as file:
        file.write(result)






