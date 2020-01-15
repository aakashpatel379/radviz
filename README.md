# RadViz Data Vizualization 

Its a RadViz Data Vizualization web application. Uses the RadViz implementation of Assignment 2 to integrate with backend to provide data. Also visualizes Assignment 1 data.

## Instructions and Features

     - Configure Virtual Environment to run the python v3 code in the system. (Pycharm Preferred)
     - Run Server.py to run the application.
     - Launch '127.0.0.1:5000/' URL to access the application.
     - Page is rendered with default settings to drop downs and buttons.
     - Defaultly visualized Red-wine quality dataset with color mode as class-based.
     - One can select among three static datasets provided, namely:
     	- Red wine quality
     	- White wine quality
     - Messages display current selection of dataset / label (for assignment 1 data visualization).
     - Clustering mode can be toggled between Class-Based and Color Based.
     	- Class Based used last column of dataframe for differenting in colors.
     	- Color Based applies K-Means algorithm to cluster data points and thus differentiated in different colors.
     - Changing the dataset would defaultly does a class based clustering on the data and thus Class-Based color mode is automatically enabled. 
     - To cluster it using K-Means algorithm one just need to click on 'Cluster-Colors' button. (Note: Value of 'k' is taken as the number of unique 'y' labels in the original dataset)
     - Switching between datasets and clustering mode takes 5-7 seconds to reflect on the visualization.
     -  To configure clustering algorithm in accordance to own requirements, one can select from init and Rand.State dropdown and click on Apply button. It will apply Color Based clustering using KMeans algorithm but with provided parameters.
     - To view co-relation matrix hover to a data point and scroll down to bottom of page.
     - Corelation matrix graph is purged with any change in Dataset.
     - Assignment 1 link takes to new tab for visualizing processed data from assignment-1
     - It works in same manner as the above functionalities. Only difference is clustering label is according to selected label in Clustering Label dropdown.



## Known Limitation
    
    - Axis label and values sometimes gets cropped in some cases.
    - Legend labels for some datasets get cropped sometimes.
    - With large number of classes K-Mean clustering would have large K and thus will converge after taking sometime.


## References

    [1]"WYanChao/RadViz", GitHub, 2019. [Online]. Available: https://github.com/WYanChao/RadViz. [Accessed: 22- Nov- 2019].

    [2]J. group, "Javascript / JQuery Toggle Active Class between 2 buttons on a button group", Stack Overflow, 2019. [Online]. Available: https://stackoverflow.com/questions/43169424/javascript-jquery-toggle-active-class-between-2-buttons-on-a-button-group. [Accessed: 23- Nov- 2019].

    [3]"Flask", PyPI, 2019. [Online]. Available: https://pypi.org/project/Flask/. [Accessed: 23- Nov- 2019].

    [4]"Heatmaps", Plot.ly, 2019. [Online]. Available: https://plot.ly/python/heatmaps/. [Accessed: 23- Nov- 2019].
    
## License
### Aakash Patel - B00807065



