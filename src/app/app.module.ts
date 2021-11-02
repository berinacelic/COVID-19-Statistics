import { BrowserModule} from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { MatSliderModule} from "@angular/material/slider";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";

import { AppComponent} from 'src/app/app.component';
import { ScatterPlotComponent} from 'src/app/components/scatter-plot/scatter-plot.component';
import { AreaChartComponent } from 'src/app/components/area-chart/area-chart.component';
import { LineChartComponent } from 'src/app/components/line-chart/line-chart.component';
import { ChoroplethMapEuComponent } from 'src/app/components/choropleth-map-eu/choropleth-map-eu.component';
import { AreaChartDataService } from 'src/app/services/area-chart-data.service';
import { MapLegendService } from 'src/app/services/map-legend.service';
import { TooltipService } from 'src/app/services/tooltip.service';
import { InteractivityService } from 'src/app/services/interactivity.service';
import { CovidTestingObservationService } from 'src/app/services/covid-testing-observation.service';


@NgModule({
  declarations: [
    AppComponent,
    AreaChartComponent,
    ScatterPlotComponent,
    ChoroplethMapEuComponent,
    LineChartComponent
  ],
  imports: [
    BrowserModule,
    MatSliderModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [
    AreaChartDataService,
    CovidTestingObservationService,
    InteractivityService,
    MapLegendService,
    TooltipService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
