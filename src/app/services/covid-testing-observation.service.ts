import {Injectable} from '@angular/core';

import * as d3 from 'd3';

@Injectable({
    providedIn: 'root'
})
export class CovidTestingObservationService {

    private testingData = [];

    constructor() {
        this.loadCovidTestingStatistics();
    }

    private loadCovidTestingStatistics() {
        Promise.all([d3.csv('./assets/data/covid-testing-all-observations.csv')]).then((data: any) => {
            this.testingData = data[0];
        });
    }

    public getTotalTestCasesFor(country: string) {
        let totalTestCases = 0;
        this.testingData.forEach(singleRow => {
            if (singleRow.Entity.includes(country)) {
                totalTestCases = singleRow['Cumulative total'] != '' ? parseInt(singleRow['Cumulative total']) : 0;
            }
        });

        return totalTestCases;
    }
}
