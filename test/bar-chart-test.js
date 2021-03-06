require("./env");

var vows = require('vows');
var assert = require('assert');

var suite = vows.describe('Bar chart');

var width = 1100;
var height = 200;

suite.addBatch({
    'time line bar chart': {
        topic: function() {
            d3.select("body").append("div").attr("id", "bar-chart");
            var chart = dc.barChart("#bar-chart");
            chart.dimension(dateDimension).group(dateGroup)
                .width(width).height(height)
                .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2012, 11, 31)]))
                .transitionDuration(0)
                .filter([new Date(2012, 5, 01), new Date(2012, 5, 30)])
                .xUnits(d3.time.days);
            chart.render();
            return chart;
        },
        'we get something': function(chart) {
            assert.isNotNull(chart);
        },
        'svg should be created': function(chart) {
            assert.isFalse(chart.select("svg").empty());
        },
        'dimension should be set': function(chart) {
            assert.equal(chart.dimension(), dateDimension);
        },
        'group should be set': function(chart) {
            assert.equal(chart.group(), dateGroup);
        },
        'width should be set': function(chart) {
            assert.equal(chart.width(), width);
        },
        'height should be set': function(chart) {
            assert.equal(chart.height(), height);
        },
        'height should be used for svg': function(chart) {
            assert.equal(chart.select("svg").attr("height"), height);
        },
        'transition duration should be set': function(chart) {
            assert.equal(chart.transitionDuration(), 0);
        },
        'margin should be set': function(chart) {
            assert.isNotNull(chart.margins());
        },
        'x can be set': function(chart) {
            assert.isTrue(chart.x() != undefined);
        },
        'x range round is auto calculated based on width': function(chart) {
            assert.equal(chart.x().range()[0], 0);
            assert.equal(chart.x().range()[1], 1030);
        },
        'y can be set': function(chart) {
            assert.isTrue(chart.y() != undefined);
        },
        'y range round is auto calculated based on height': function(chart) {
            assert.equal(chart.y().range()[0], 160);
            assert.equal(chart.y().range()[1], 0);
        },
        'y domain is auto calculated based on height': function(chart) {
            assert.equal(chart.y().domain()[0], 0);
            assert.equal(chart.y().domain()[1], 3);
        },
        'root g should be created': function(chart) {
            assert.isFalse(chart.select("svg g").empty());
        },
        'root g should be translated to left corner': function(chart) {
            assert.equal(chart.select("svg g").attr("transform"), "translate(20,10)");
        },
        'axis x should be placed at the bottom': function(chart) {
            assert.equal(chart.select("svg g g.x").attr("transform"), "translate(20,170)");
        },
        'axis y should be placed on the left': function(chart) {
            assert.equal(chart.select("svg g g.y").attr("transform"), "translate(20,10)");
        },
        'bar x should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('x'), chart.x()(d.key) + chart.margins().left);
            });
        },
        'bar y should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('y'), chart.margins().top + chart.y()(d.value));
            });
        },
        'bar height should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('height'),
                    chart.height() - chart.margins().top - chart.margins().bottom - chart.y()(d.value) - 1);
            });
        },
        'bar width should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('width'), 2);
            });
        },
        'x units should be set': function(chart) {
            assert.equal(chart.xUnits(), d3.time.days);
        },
        'x axis should be created': function(chart) {
            assert.isNotNull(chart.axisX());
        },
        'y axis should be created': function(chart) {
            assert.isNotNull(chart.axisY());
        },
        'brush should be created': function(chart) {
            assert.isNotNull(chart.select("g.brush"));
        },
        'round should be off by default': function(chart) {
            assert.isTrue(chart.round() == null);
        },
        'round can be changed': function(chart) {
            chart.round(d3.time.day.round)
            assert.isNotNull(chart.round());
        },

        'with brush': {
            'be positioned with offset (left margin)': function(chart) {
                assert.equal(chart.select("g.brush").attr("transform"), "translate(" + chart.margins().left + ",0)");
            },
            'brush fancy resize handle should be created': function(chart) {
                chart.select("g.brush").selectAll(".resize path").each(function(d, i) {
                    if (i == 0)
                        assert.equal(d3.select(this).attr("d"), "M0.5,56.666666666666664A6,6 0 0 1 6.5,62.666666666666664V107.33333333333333A6,6 0 0 1 0.5,113.33333333333333ZM2.5,64.66666666666666V105.33333333333333M4.5,64.66666666666666V105.33333333333333");
                    else
                        assert.equal(d3.select(this).attr("d"), "M-0.5,56.666666666666664A6,6 0 0 0 -6.5,62.666666666666664V107.33333333333333A6,6 0 0 0 -0.5,113.33333333333333ZM-2.5,64.66666666666666V105.33333333333333M-4.5,64.66666666666666V105.33333333333333");
                });
            },
            'background should be stretched': function(chart) {
                assert.equal(chart.select("g.brush rect.background").attr("width"), 1030);
            },
            'background height should be set to chart height': function(chart) {
                assert.equal(chart.select("g.brush rect.background").attr("height"), 170);
            },
            'extent height should be set to chart height': function(chart) {
                assert.equal(chart.select("g.brush rect.extent").attr("height"), 170);
            },
            'extent width should be set based on filter set': function(chart) {
                assert.equal(chart.select("g.brush rect.extent").attr("width"), 82);
            },
            'unselected bars should be push to background': function(chart) {
                assert.equal(chart.select("g rect.bar").attr("class"), "bar deselected");
            },
            'selected bars should be push to foreground': function(chart) {
                chart.selectAll("g rect.bar").each(function(d, i) {
                    if (i == 1)
                        assert.equal(d3.select(this).attr("class"), "bar");
                });
            },
            'after reset all bars should be pushed to foreground': function(chart) {
                chart.filterAll();
                chart.redraw();
                chart.selectAll("g rect.bar").each(function(d) {
                    assert.equal(d3.select(this).attr("class"), "bar");
                });
            }
        },

        'extra large externally filtered bar chart': {
            topic: function() {
                resetAllFilters();
                valueDimension.filter(66);
                d3.select("body").append("div").attr("id", "bar-chart2");
                var chart = dc.barChart("#bar-chart2");
                chart.dimension(dateDimension).group(dateGroup)
                    .width(width).height(height)
                    .x(d3.time.scale().domain([new Date(2000, 0, 1), new Date(2012, 11, 31)]))
                    .xUnits(d3.time.days);
                chart.render();
                return chart;
            },
            'min bar width should be set correctly': function(chart) {
                chart.selectAll("svg g rect.bar").each(function(d) {
                    assert.equal(d3.select(this).attr('width'), 1);
                });
            },
            'no bar should be deselected': function(chart) {
                chart.selectAll("svg g rect.bar").each(function(d) {
                    assert.equal(d3.select(this).attr('class'), "bar");
                });
            }
        },

        'linear number bar chart': {
            topic: function() {
                resetAllFilters();
                d3.select("body").append("div").attr("id", "bar-chart3");
                var chart = dc.barChart("#bar-chart3");
                chart.dimension(valueDimension).group(valueGroup)
                    .width(400).height(150)
                    .x(d3.scale.linear().domain([10,80]))
                    .elasticAxisY(true)
                    .transitionDuration(0);
                chart.render();
                return chart;
            },

            'y axis height should be based on max': function(chart) {
                var scaleToThree = false;
                chart.select("g.y").selectAll("g").each(function(d, i) {
                    if (d3.select(this).select("text").text() == "3.0")
                        scaleToThree = true;
                });
                assert.isTrue(scaleToThree);
            },

            'y axis should be rescaled when filter applied': function(chart){
                var scaleToThree = false;
                countryDimension.filter("CA");
                chart.redraw();
                chart.select("g.y").selectAll("g").each(function(d, i) {
                    if (d3.select(this).select("text").text() == "3.0")
                        scaleToThree = true;
                });
                assert.isFalse(scaleToThree);
            }
        },

        teardown: function(topic) {
            resetAllFilters();
        }
    }
});

suite.export(module);


