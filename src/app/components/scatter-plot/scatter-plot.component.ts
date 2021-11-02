import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3';

import { InteractivityService } from 'src/app/services/interactivity.service';
import { TooltipService } from 'src/app/services/tooltip.service';
import { CovidTestingObservationService } from 'src/app/services/covid-testing-observation.service';
import { MapLegendService} from 'src/app/services/map-legend.service';


const ONE_MILLION = 1000000;
const DATA_FILE_URL = './assets/data/owid-covid-data.csv';

@Component({
    selector: 'app-scatter-plot',
    templateUrl: './scatter-plot.component.html',
    styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {

    public title = 'Number of testcases performed with respect to the population';
    private readonly DEFAULT_SELECTED_COLOR = '#FF4500';
    private readonly WHITE_COLOR = '#FFF';
    private readonly X_AXIS_LABEL = 'Population';
    private readonly Y_AXIS_LABEL = 'Tests performed';

    private svg;
    private x;
    private y;
    private margin = 70;
    private yAxisTitleMargin = 65;
    private width = 800 - (this.margin * 2);
    private height = 685 - (this.margin * 2);
    private selectedCountries = [];
    private tooltip;
    private europaData = [];
    private europeCountries = new Set();
    private euReadyData = [];

    constructor(private interactivityService: InteractivityService,
                private tooltipService: TooltipService,
                private covidTestingObservationService: CovidTestingObservationService,
                private mapLegendService: MapLegendService) {
    }

    ngOnInit() {
        this.subscribeForCountrySelection();
        this.createSvg();

        Promise.all([d3.csv(DATA_FILE_URL)]).then((data: any) => {
            data[0].forEach(item => {
                if (item.continent == 'Europe') {
                    this.europaData.push(item);
                }
            });

            this.europaData
                .forEach(singleRow => {
                    this.europeCountries.add(singleRow.location);
                });

            this.europaData
                .forEach(singleRow => {
                    this.addToEuReadyData(singleRow)
                });

            this.drawPlot(this.euReadyData);

        });

        this.tooltip = this.tooltipService.createTooltip();
    }

    private addToEuReadyData(row) {
        if (this.euReadyData.length == 0) {
            this.addCountry(row);
            return;
        }

        if (!this.countryAdded(row)) {
            this.addCountry(row);
        }
    }

    private countryAdded(row) {
        let countryAdded = false;
        this.euReadyData.forEach(countryDetails => {
            if (countryDetails.country === row.location) {
                countryAdded = true;
            }
        })

        return countryAdded;
    }

    private addCountry(row) {
        let totalTests = this.covidTestingObservationService.getTotalTestCasesFor(row.location);

        this.euReadyData.push({
            country: row.location,
            data: {
                population: parseInt(row.population),
                totalTests: totalTests
            },
            filtered: false
        })
    }

    private createSvg() {
        this.svg = d3.select('figure#scatter')
            .append('svg')
            .attr('width', this.width + (this.margin * 2))
            .attr('height', this.height + (this.margin * 2))
            .append('g')
            .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');

        this.x = d3.scaleLinear()
            .domain([0, 100000000])
            .range([0, this.width]);

        this.svg.append('g')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3.axisBottom(this.x).tickFormat(function (d) {
                return d / ONE_MILLION + ' M'
            }));

        // Add Y axis
        this.y = d3.scaleLinear()
            .domain([0, 70000000])
            .range([this.height, 0]);

        // add label for x-axis
        this.svg.append('text')
            .attr('transform', 'translate(' + (this.width / 2) + ' ,' + (this.height + 40) + ')')
            .style('text-anchor', 'middle')
            .text(this.X_AXIS_LABEL);


        this.svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.yAxisTitleMargin)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(this.Y_AXIS_LABEL);

        this.svg.append('g')
            .call(d3.axisLeft(this.y).tickFormat(function (d) {
                return d / ONE_MILLION + ' M'
            }));
    }

    drawPlot(readyData: any) {
        this.svg.selectAll('.dots').remove();

        let brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on('start brush', () => {
                let selection = d3.event.selection

                let x0 = this.x.invert(selection[0][0]);
                let x1 = this.x.invert(selection[1][0]);
                let y0 = this.y.invert(selection[1][1]);
                let y1 = this.y.invert(selection[0][1]);

                this.onBrush(readyData, x0, x1, y0, y1);
            });

        this.svg.append('g')
            .attr('class', 'brush')
            .call(brush)

        this.update(readyData);
    }

    private update(readyData: any, selectedOnMap: boolean = false) {
        if (readyData.length > 0) {
            this.svg.selectAll('.dots').remove();

            let dots = this.svg
                .append('g')
                .attr('class', 'dots');

            dots.selectAll('dot')
                .data(readyData)
                .enter()
                .append('circle')
                .attr('cx', d => {
                    return this.x(d.data['population']);
                })
                .attr('cy', d => {
                    return this.y(d.data['totalTests']);
                })
                .attr('r', 6)
                .style('stroke', d => {
                    return (selectedOnMap && !d.filtered) ? this.DEFAULT_SELECTED_COLOR : this.WHITE_COLOR;
                })
                .style('fill', (d) => {
                    return this.mapLegendService.determineColorFor(d.data['population'], d.data['totalTests']);
                })
                .style('opacity', (d) => {
                    return d.filtered ? 0.5 : 1
                })
                .style('stroke-width', (d) => {
                    if (selectedOnMap) {
                        return d.filtered ? 1 : 3
                    }
                    return d.filtered ? 1 : 2
                })
                .on('mouseover', d => {
                    this.tooltipService.showTooltip(d, this.tooltip);
                })
                .on('mouseout', () => {
                    this.tooltipService.hideTooltip(this.tooltip);
                })
                .on('mouseclick', () => {
                    this.tooltipService.hideTooltip(this.tooltip);
                });

            this.selectedCountries = readyData.filter(x => x.filtered === false);

            const countriesToChangeColor = this.selectedCountries.length != 0
                ? this.mapSelectedCountries(this.selectedCountries)
                : this.mapSelectedCountries(readyData);

            this.interactivityService.updatePlotSelectedCountries(countriesToChangeColor);
        }
    }

    private onBrush(data, x0, x1, y0, y1) {
        this.tooltipService.hideTooltip(this.tooltip);
        let clear = x0 === x1 || y0 === y1
        data.forEach(country => {
            country.filtered = clear
                ? false
                : country.data.population < x0 || country.data.population > x1 || country.data.totalTests < y0 || country.data.totalTests > y1
        })

        this.update(data);
    }

    /* subscribe for selected country in the geo map */
    private subscribeForCountrySelection() {
        this.interactivityService.mapSelectedCountry.subscribe(
            selectedCountry => {
                this.euReadyData.forEach(countryData => {
                    if (this.isSomeOfSpecialCountries(selectedCountry, countryData)) {
                        countryData.filtered = false;
                    } else {
                        countryData.filtered = countryData.country !== selectedCountry;
                    }
                })

                this.update(this.euReadyData, true);
            }
        );
    }

    // because of the naming problems
    private isSomeOfSpecialCountries(selectedCountry: string, countryData) {
        return this.isBosniaAndHerzegovina(selectedCountry, countryData)
            || this.isMacedonia(selectedCountry, countryData)
            || this.isCzechRepublic(selectedCountry, countryData);
    }

    private isBosniaAndHerzegovina(selectedCountry: string, countryData) {
        return selectedCountry === 'Bosnia and Herz.' && countryData.country === 'Bosnia and Herzegovina';
    }

    private isMacedonia(selectedCountry: string, countryData) {
        return selectedCountry.includes('Macedonia') && countryData.country.includes('Macedonia');
    }

    private isCzechRepublic(selectedCountry: string, countryData) {
        return selectedCountry.includes('Czech') && countryData.country.includes('Czech');
    }

    public mapSelectedCountries(data) {
        return data.map(selectedCountry => {
            return {
                country: selectedCountry.country,
                color: this.mapLegendService.determineColorFor(selectedCountry.data['population'], selectedCountry.data['totalTests'])
            }
        })
    }
}

