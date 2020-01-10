function onChangeFunction()
{
    var checkedValue = $('.crimeCheckbox:checked').val();

    var crimeArray = [];
            $("input:checkbox[name=Type]:checked").each(function() {
                crimeArray.push($(this).val());
            });
    $.ajax({
        url: "/getGraphData",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedCrime':JSON.stringify(crimeArray),
            'selectedYear': document.getElementById('selectYear').value

        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
            Plotly.newPlot('lineGraph', data )
        },
    });
    $.ajax({
        url: "/getData",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedCrime':JSON.stringify(crimeArray),
            'selectedYear': document.getElementById('selectYear').value

        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
                    $('#map').empty();
                    alert("in success")
                var link = "/static/map.html"
                var iframe = document.createElement('iframe');
                iframe.width="100%";
                iframe.height="350";
                iframe.setAttribute("src", link);
                document.getElementById("map").appendChild(iframe);
        },
      error: function (result, status, err) {
        alert(result.responseText);
        alert(status.responseText);
        alert(err.Message);
      }
    });
}
function yearSelectFunction()
{
    $.ajax({
        url: "/getBarChart",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedYear': document.getElementById('selectYear').value

        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
            var myPlot = document.getElementById('barGraph')
            Plotly.newPlot('barGraph', data )
            myPlot.on('plotly_click', function(data){
                   info = data['points']
                   temp = info[0]
                   neighbourhood=temp['y']
                getPieChart(neighbourhood)

});
        },
    });

}

function getPieChart(neighbourhood)
{
    $.ajax({
        url: "/getPieGraph",
        type: "GET",
        contentType: 'application/json;charset=UTF-8',
        data: {

            'selectedYear': document.getElementById('selectYear').value,
            'selectedNeighbourhood':neighbourhood

        },
        dataType:"json",
        crossDomain: true,
        success: function (data) {
            Plotly.newPlot('pieGraph', data )
        },
    });
}

function openSideView() {
                document.getElementById("SideView").style.width = "250px";
            }
            function closeSideView() {
                document.getElementById("SideView").style.width = "0";
            }