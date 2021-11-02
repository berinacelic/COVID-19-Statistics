import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MapLegendService {

    public determineColorFor(population: number, testsPerformed: number) {
        if (population > 0 && testsPerformed >=0 && population != null && testsPerformed != null) {
            let percentage = (testsPerformed / population) * 100;

            if (percentage <= 25) {
                return '#5698b9';
            } else if (percentage >= 25 && percentage <= 50) {
                return '#be64ac';
            } else if (percentage > 50 && percentage <= 75) {
                return '#8c62aa';
            } else {
                return '#3b4994';
            }
        }
        return '#fbb4b9';
    }
}
