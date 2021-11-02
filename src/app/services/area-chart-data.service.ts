import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import * as d3 from 'd3';

import {AreaChartData} from 'src/app/models/area-chart-data';
import {LineChartData} from 'src/app/models/line-chart-data';

const DATA_LOCATION_PATH = './assets/data/owid-covid-data.csv';

@Injectable({
    providedIn: 'root'
})
export class AreaChartDataService {

    private _dataLoaded = new BehaviorSubject<boolean>(false);
    public isDataLoaded = this._dataLoaded.asObservable();
    private parseDate = d3.timeParse('%Y-%m-%d');
    private data: any;

    constructor() {
        this.loadDataFromFile();
    }

    private loadDataFromFile() {
        Promise.all([d3.csv(DATA_LOCATION_PATH)]).then((data: any) => {
            this.data = data[0];
            this._dataLoaded.next(true);
        });
    }

    public getDataForCountry(countryName: string) {
        let countryData = {
            new_deaths: [],
            new_cases: []
        };
        this.data.forEach(row => {
            if (row.location === countryName || this.isBosniaAndHerzegovina(row, countryName)
                || this.isCzechRepublic(row, countryName) || this.isMacedonia(row, countryName)) {
                let newDeaths = row.new_deaths != '' ? parseInt(row.new_deaths) : 0;
                let newCases = row.new_cases != '' ? parseInt(row.new_cases) : 0;

                countryData.new_deaths.push(new AreaChartData(this.parseDate(row.date), newDeaths));
                countryData.new_cases.push(new AreaChartData(this.parseDate(row.date), newCases));
            }
        })

        return countryData;
    }

    public getTotalTestsPerNewCasesFor(country: string): LineChartData[] {
        let countryData = [];

        this.data.forEach(row => {
            if (row.location === country || this.isBosniaAndHerzegovina(row, country)
                || this.isCzechRepublic(row, country) || this.isMacedonia(row, country)) {
                const newCases = row.new_cases != '' ? parseInt(row.new_cases) : 0;
                const totalTests = row.new_tests != '' ? parseInt(row.new_tests) : 0;

                countryData.push(new LineChartData(this.parseDate(row.date), newCases, totalTests));
            }
        });

        return countryData;
    }

    private isBosniaAndHerzegovina(row: any, country: string) {
        return row.location.startsWith('Bosnia') && country === 'Bosnia and Herz.';
    }

    private isCzechRepublic(row: any, country: string) {
        return row.location.startsWith('Czech') && country.startsWith('Czech');
    }

    private isMacedonia(row: any, country: string) {
        return row.location.includes('Macedonia') && country.includes('Macedonia');
    }
}
