from flask import Flask, render_template, request
from sklearn.cluster import KMeans
import ast
import json
import pandas as pd
from flask_cors import CORS
import plotly
import plotly.graph_objs as go
import plotly.express as px


app = Flask(__name__, template_folder="templates")
cors = CORS(app)
df = pd.read_csv('./winequality-red.csv')


@app.route('/')
def home():
    json_response = json.loads(df.to_json(orient='records'))
    print(json_response)
    return render_template('home.html', data=json.dumps(json_response))

@app.route('/displaycsv', methods=['POST', 'GET'])
def displaycsv():
    global df
    df = pd.read_csv('./winequality-white.csv')
    json_response = json.loads(df.to_json(orient='records'))
    return json.dumps(json_response)

@app.route('/labelUpdate', methods=['POST', 'GET'])
def updateLabel():
    arguments = request.args
    df_a1 = pd.read_csv('./dataset1_processed_updated.csv')
    numcols =['age', 'fnlwgt', 'education-num', 'capital-gain', 'capital-loss', 'hours-per-week']
    labelcol = arguments['label']
    numcols.append(labelcol)
    global df_al
    df_a1_filtered = df_a1[numcols]
    json_response = json.loads(df_a1_filtered.to_json(orient='records'))
    return json.dumps(json_response)

@app.route('/applyAlgoParameters', methods=['POST', 'GET'])
def applyAlgoParamsKMeans():
    arguments = request.args
    rstate = arguments['randomstate']
    init = str(arguments['init'])
    if('means' in init):
        init =init.strip()
        init+="++"
    csvname = arguments['name']
    colormode = arguments['mode']
    print(csvname+":"+colormode)

    global df
    df = pd.read_csv('./' + csvname + '.csv')
    labelcol = df.columns
    labelcol = labelcol[-1]
    classes = df[labelcol].unique()

    if colormode != "Class-Based":
        del df[labelcol]
        kmeans = KMeans(n_clusters=len(classes),init=init,random_state=int(rstate))
        kmeans.fit(df)
        y_kmeans = kmeans.predict(df)
        labels = list(y_kmeans)
        labels = kmeans.labels_
        df['labels'] = labels
    json_response = json.loads(df.to_json(orient='records'))
    return json.dumps(json_response)

@app.route('/load', methods=['POST', 'GET'])
def readcsv():
    arguments = request.args
    csvname = arguments['name']
    print(csvname)
    global df
    df = pd.read_csv('./' + csvname + '.csv')
    json_response = json.loads(df.to_json(orient='records'))
    return json.dumps(json_response)

@app.route('/correlationMatrix', methods=['POST', 'GET'])
def calculateCorrelationMatrix():
    arguments = request.args
    try:
        cid = int(arguments['clusterid'])
    except ValueError:
        cid = arguments['clusterid']

    global df
    labelcol = df.columns
    labelcol = labelcol[-1]
    df_filtered = df[df[labelcol] == cid]
    x = list(df_filtered.columns)
    x.pop()
    fig = go.Figure(data=go.Heatmap(
        z=df_filtered.corr(),
        x=x,
        y=x,
        colorscale='Reds'
    ))

    fig['layout'].update(title="Correlation Matrix")
    json_response=json.loads(fig.to_json())
    return json.dumps(json_response)

@app.route('/visualizeA1Assignment', methods=['POST', 'GET'])
def getAssignment1Data():

    df_a1 = pd.read_csv('./dataset1_processed_updated.csv')
    df_a1_filtered = df_a1[['age', 'fnlwgt', 'education-num', 'capital-gain', 'capital-loss', 'hours-per-week', 'salary']]
    json_response = json.loads(df_a1_filtered.to_json(orient='records'))
    return render_template('a1_dataset.html', data=json.dumps(json_response))

@app.route('/clusterizeA1', methods=['POST', 'GET'])
def clusterizeA1Data():
    df_a1 = pd.read_csv('./dataset1_processed_updated.csv')
    arguments = request.args
    lbl = arguments['label']
    numcols = ['age', 'fnlwgt', 'education-num', 'capital-gain', 'capital-loss', 'hours-per-week', lbl]
    colormode = arguments['mode']
    df_a1_filtered = df_a1[numcols]
    classes = df_a1_filtered[lbl].unique()

    if colormode != "Class-Based":
        del df_a1_filtered[lbl]
        kmeans = KMeans(n_clusters=len(classes))
        kmeans.fit(df_a1_filtered)
        y_kmeans = kmeans.predict(df_a1_filtered)
        labels =list(y_kmeans)
        labels = kmeans.labels_
        df_a1_filtered['labels'] = labels
    json_response = json.loads(df_a1_filtered.to_json(orient='records'))
    return json.dumps(json_response)

@app.route('/clusterize', methods=['POST', 'GET'])
def clusterizeData():
    arguments = request.args
    csvname = arguments['name']
    colormode = arguments['mode']
    print(csvname+":"+colormode)
    global df
    df = pd.read_csv('./' + csvname + '.csv')
    labelcol = df.columns
    labelcol = labelcol[-1]
    classes = df[labelcol].unique()

    if colormode != "Class-Based":
        del df[labelcol]
        kmeans = KMeans(n_clusters=len(classes))
        kmeans.fit(df)
        y_kmeans = kmeans.predict(df)
        labels =list(y_kmeans)
        labels = kmeans.labels_
        df['labels'] = labels
    json_response = json.loads(df.to_json(orient='records'))
    return json.dumps(json_response)


if __name__ == '__main__':
    app.run(debug=True)
