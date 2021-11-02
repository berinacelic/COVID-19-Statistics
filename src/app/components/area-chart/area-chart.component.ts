import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3';

import { AreaChartDataService } from 'src/app/services/area-chart-data.service';
import { InteractivityService } from 'src/app/services/interactivity.service';
import { AreaChartData } from 'src/app/models/area-chart-data';

const COLOR_BLUE = '#1f78b4';
const COLOR_RED = '#e31a1c';

const HEIGHT = 600;
const WIDTH = 800;
const MARGIN = {
    left: 40,
    right: 40,
    top: 20,
    bottom: 100
}

@Component({
    selector: 'app-area-chart',
    templateUrl: 'area-chart.component.html',
    styleUrls: ['area-chart.component.css']
})
export class AreaChartComponent implements OnInit {

    public selectedCountry;
    private svg;

    constructor(private areaChartService: AreaChartDataService,
                private interactivityService: InteractivityService) {
    }

    ngOnInit() {
        this.areaChartService.isDataLoaded.subscribe(
            dataLoaded => {
                if (dataLoaded) {
                    this.interactivityService.mapSelectedCountry.subscribe(
                        selectedCountry => {
                            this.updateActiveCountry(selectedCountry);
                            this.clearExistingSvg();
                            this.initializeSvg();

                            const data = this.areaChartService.getDataForCountry(selectedCountry);

                            const x = d3.scaleUtc()
                                .domain(d3.extent(data.new_cases, (d) => d.date))
                                .range([MARGIN.left, WIDTH - MARGIN.right]);

                            const y = d3.scaleLinear()
                                .domain([0, d3.max(data.new_cases, (d) => d.value)])
                                .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

                            this.createAreaChartFor(data.new_cases, COLOR_BLUE, x, y);
                            this.createAreaChartFor(data.new_deaths, COLOR_RED, x, y);

                            this.addXAxisLabel();
                            this.addYAxisLabel();
                        }
                    )
                }
            }
        );
    }

    private updateActiveCountry(selectedCountry: string) {
        this.selectedCountry = selectedCountry;
    }

    private createAreaChartFor(data: AreaChartData[], areaColor: string, x: any, y: any) {
        const curve = d3.curveLinear;
        const area = this.createArea(curve, x, y);

        const xAxis = this.createXAxis(x);
        const yAxis = this.createYAxis(y);

        this.appendPathToSvg(data, area, areaColor);

        this.appendXAxis(xAxis);
        this.appendYAxis(yAxis);
    }

    private initializeSvg() {
        this.svg = d3.select('#ui-area-chart')
            .append('svg')
            .attr('width', WIDTH - MARGIN.left - MARGIN.right)
            .attr('height', HEIGHT - MARGIN.bottom - MARGIN.top)
            .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    }

    private appendXAxis(xAxis: (g) => any) {
        this.svg.append('g')
            .call(xAxis);
    }

    private appendYAxis(yAxis: (g) => any) {
        this.svg.append('g')
            .call(yAxis);
    }

    private createArea(curve: any, x: any, y: any) {
        return d3.area().curve(curve)
            .x((d) => x(d['date']))
            .y0(y(0))
            .y1((d) => y(d['value']));
    }

    private createXAxis(x: any) {
        return g => g
            .attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d')))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-90)');
    }

    private createYAxis(y: any) {
        return g => g.attr('transform', `translate(${MARGIN.left},0)`)
            .call(d3.axisLeft(y));
    }

    private appendPathToSvg(data: any, area: any, areaColor: string) {
        this.svg.append('path')
            .datum(data)
            .attr('fill', areaColor)
            .attr('d', area);
    }

    private addXAxisLabel() {
        this.svg.append('text')
            .attr('transform', 'translate(' + (WIDTH / 2) + ' ,' + (HEIGHT - 15) + ')')
            .style('text-anchor', 'middle')
            .text('Time');
    }

    private addYAxisLabel() {
        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - 20)
            .attr('x', 0 - (HEIGHT / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Death cases / New cases');
    }

    private clearExistingSvg() {
        document.getElementById('ui-area-chart').innerHTML = '';
    }
}
