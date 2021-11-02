import {Injectable} from "@angular/core";

import * as d3 from 'd3';

@Injectable({
    providedIn: "root"
})
export class TooltipService {

    public showTooltip(d: any, tooltip: any) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);

        tooltip.text(d.country)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    public hideTooltip(tooltip: any) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    public createTooltip() {
        return d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
}
