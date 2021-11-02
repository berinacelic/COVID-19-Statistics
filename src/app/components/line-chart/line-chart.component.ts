import {Component, OnInit} from '@angular/core';

import * as d3 from 'd3';

import { AreaChartDataService } from 'src/app/services/area-chart-data.service';
import { InteractivityService } from 'src/app/services/interactivity.service';


@Component({
    selector: 'app-line-chart',
    templateUrl: 'line-chart.component.html',
    styleUrls: ['line-chart.component.css']
})
export class LineChartComponent implements OnInit {

    public selectedCountry;

    constructor(private dataService: AreaChartDataService,
                private interactivityService: InteractivityService) {
    }

    ngOnInit() {
        this.dataService.isDataLoaded.subscribe(isDataLoaded => {
            if (isDataLoaded) {
                this.interactivityService.mapSelectedCountry.subscribe(selectedCountry => {
                    this.updateSelectedCountry(selectedCountry);
                    this.clearExistingSvg();
                    const data = this.dataService.getTotalTestsPerNewCasesFor(selectedCountry);

                    // set the dimensions and margins of the graph
                    var margin = {top: 20, right: 20, bottom: 70, left: 80},
                        width = 700 - margin.left - margin.right,
                        height = 470 - margin.top - margin.bottom;

                    // set the ranges
                    var x = d3.scaleTime().range([0, width]);
                    var y = d3.scaleLinear().range([height, 0]);

                    // define the 1st line
                    var newCasesLine = d3.line()
                        .x(function (d) {
                            return x(d.date);
                        })
                        .y(function (d) {
                            return y(d.new_cases);
                        });

                    // define the 2nd line
                    var newTestsPerformedLine = d3.line()
                        .x(function (d) {
                            return x(d.date);
                        })
                        .y(function (d) {
                            return y(d.total_tests);
                        });

                    // append the svg object to the body of the page
                    // appends a 'group' element to 'svg'
                    // moves the 'group' element to the top left margin
                    var svg = d3.select('#ui-line-chart').append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom + 30)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    // Scale the range of the data
                    x.domain(d3.extent(data, function (d) {
                        return d.date;
                    }));
                    y.domain([0, d3.max(data, function (d) {
                        return Math.max(d.total_tests, d.new_cases);
                    })]);

                    // Add the newCasesLine path.
                    svg.append('path')
                        .data([data])
                        .attr('class', 'line')
                        .attr('d', newTestsPerformedLine);

                    // Add the newTestsPerformedLine path.
                    svg.append('path')
                        .data([data])
                        .attr('class', 'line')
                        .style('stroke', 'red')
                        .attr('d', newCasesLine);

                    // Add the X Axis
                    svg.append('g')
                        .attr('transform', 'translate(0,' + height + ')')
                        .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d')))
                        .selectAll('text')
                        .style('text-anchor', 'end')
                        .attr('dx', '-.8em')
                        .attr('dy', '.15em')
                        .attr('transform', 'rotate(-90)');

                    svg.append('text')
                        .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 80) + ')')
                        .style('text-anchor', 'middle')
                        .text('Time');

                    // Add the Y Axis
                    svg.append('g').call(d3.axisLeft(y));

                    // add Y axis label
                    svg.append('text')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 0 - 70)
                        .attr('x', 0 - (height / 2))
                        .attr('dy', '1em')
                        .style('text-anchor', 'middle')
                        .text('Test performed / New cases');
                })
            }
        })
    }

    private updateSelectedCountry(selectedCountry: string) {
        this.selectedCountry = selectedCountry;
    }

    private clearExistingSvg() {
        document.getElementById('ui-line-chart').innerHTML = '';
    }
}
