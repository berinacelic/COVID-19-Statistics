import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3';

import { Country, InteractivityService } from 'src/app/services/interactivity.service';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const DATA_FILE_NAME = './assets/data/eu-states-geo.json';
const NOT_SELECTED_DEFAULT_COLOR = 'rgb(213,222,217)';

@Component({
    selector: 'app-choropleth-map-eu',
    templateUrl: 'choropleth-map-eu.component.html',
    styleUrls: ['choropleth-map-eu.component.css']
})
export class ChoroplethMapEuComponent implements OnInit {

    public title = 'Density of tests performed with respect to the population';
    private svg;
    private selectedCountry;

    constructor(private interactivityService: InteractivityService) {
    }

    ngOnInit(): void {
        this.subscribeForScatterPlotChanges();
        this.initMap();
    }

    initMap(): void {
        // D3 Projection
        const projection = d3.geoMercator()
            .center([33, 58]) // put focus/zoom on Europe countries
            /*.center([23, 5]) // put focus/zoom on Europe countries*/ // africa
            .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
            .scale([MAP_WIDTH / 1.5]);

        // Define path generator
        let path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
            .projection(projection);          // tell path generator to use get mercator projection wit focus on EU

        //Create SVG element and append map to the SVG
        this.svg = d3.select('.map-container')
            .append('svg')
            .attr('class', 'geoMap')
            .attr('width', MAP_WIDTH)
            .attr('height', MAP_HEIGHT);

        // listen for click events outside the map and deselect previously selected county
        const svgEl = document.querySelector('.geoMap');
        svgEl.addEventListener('click', (e: any) => {
            if (e.toElement.localName === 'svg') {
                this.updateMapSelectedCountry('null');
            }
        })

        // Load in my states data!
        d3.json(DATA_FILE_NAME).then(json => {
            this.svg.selectAll('path')
                .data(json.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('stroke', '#fff')
                .style('stroke-width', '1')
                .style('fill', function (d) {
                    return NOT_SELECTED_DEFAULT_COLOR;
                })
                .on('click', singleCountryData => {
                     this.onMouseActionClick(singleCountryData);
                });
        });
    }

    private onMouseActionClick(singleCountryData) {
        this.deselectAll(this.svg, singleCountryData.properties.name);
        this.selectedCountry = {
            country: singleCountryData.properties.name,
            color: 'rgb(217,91,67)'
        };
        this.changeColorForSelectedCountries(this.svg, [this.selectedCountry]);
        this.updateMapSelectedCountry(singleCountryData.properties.name);
    }

    private subscribeForScatterPlotChanges() {
        this.interactivityService.selectedCountries.subscribe(
            selectedCountries => {
                this.changeColorForSelectedCountries(this.svg, selectedCountries);
            }
        )
    }

    private changeColorForSelectedCountries(svg: any, selectedCountries: Country[]) {
        if (svg) {
            svg.selectAll('path')
                .style('fill', function (d) {
                    for (let cnt in selectedCountries) {
                        if (d.properties.name === selectedCountries[cnt].country) {
                            return selectedCountries[cnt].color;
                        } else if((d.properties.name === 'Bosnia and Herz.' && selectedCountries[cnt].country.startsWith('Bosnia'))
                            || (d.properties.name === 'Czech Rep.' && selectedCountries[cnt].country.startsWith('Czech'))
                            || (d.properties.name.includes('Macedonia') && selectedCountries[cnt].country.includes('Macedonia'))){

                            return selectedCountries[cnt].color;
                        }
                    }

                    return NOT_SELECTED_DEFAULT_COLOR;
                });
        }
    }

    // interactivity on the map
    public updateMapSelectedCountry(selectedCountry: string) {
        this.interactivityService.updateMapSelectedCountry(selectedCountry);
    }

    public deselectAll(svg: any, selectedCountry: string) {
        if (svg) {
            svg.selectAll('path')
                .style('fill', function (d) {
                    if (d.properties.name !== selectedCountry) {
                        return NOT_SELECTED_DEFAULT_COLOR;
                    }
                });
        }
    }
}
