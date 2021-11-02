import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export interface Country {
    country: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class InteractivityService {
    private readonly SELECTED_COUNTRY_DEFAULT_VALUE = 'Austria';

    private _mapSelectedCountry = new BehaviorSubject<string>(this.SELECTED_COUNTRY_DEFAULT_VALUE);
    public mapSelectedCountry = this._mapSelectedCountry.asObservable();

    private _selectedCountries = new BehaviorSubject<Country[]>([]);
    public selectedCountries = this._selectedCountries.asObservable();


    public updateMapSelectedCountry(selectedCountry: string) {
        this._mapSelectedCountry.next(selectedCountry);
    }

    public updatePlotSelectedCountries(countries: Country[]) {
        this._selectedCountries.next(countries);
    }
}
