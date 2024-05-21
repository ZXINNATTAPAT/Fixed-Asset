import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import worldGeoJSON from "@amcharts/amcharts5-geodata/worldLow";
import { FeatureCollection, Feature, Geometry, GeoJsonProperties } from 'geojson';
import am5geodata_thailandHigh from "@amcharts/amcharts5-geodata/thailandHigh";  // Import GeoJSON data for Thailand


@Component({
  selector: 'app-thailand-map',
  standalone: true,
  imports: [],
  templateUrl: './thailand-map.component.html',
  styleUrl: './thailand-map.component.scss'
})
export class ThailandMapComponent implements AfterViewInit, OnDestroy {
  private root: am5.Root | undefined;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      let root = am5.Root.new("chartdivmap");

      root.setThemes([
        am5themes_Animated.new(root)
      ]);

      // Create the map chart
      let chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "none",
        panY: "none",
        projection: am5map.geoMercator()
      }));

      // Create polygon series for Thailand
      let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_thailandHigh,
        calculateAggregates: true,
        valueField: "value"
      }));

      // Generate random data for demonstration
      let geodata = am5geodata_thailandHigh;
      let data = [];
      for (var i = 0; i < geodata.features.length; i++) {
        data.push({
          id: geodata.features[i].id,
          value: Math.round(Math.random() * 10000)
        });
      }

      // Set geoJSON data and polygon series data
      polygonSeries.set("geoJSON", geodata);
      polygonSeries.data.setAll(data);

      // Apply heat rules to the polygon series
      polygonSeries.set("heatRules", [{
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color(0x90EE90),  // Light green (PaleGreen)
        max: am5.color(0x006400),  // Dark green (DarkGreen)
        key: "fill"
      }]);

      // Set tooltip and interaction for map polygons
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true
      });

      // polygonSeries.mapPolygons.template.events.on("pointerover", function(ev) {
      //   if (ev.target.series?.chart) {
      //     let geometry = ev.target.dataItem.get["geometry"];
      //     if (geometry) {
      //       let bounds = am5map.getBounds(geometry);
      //       chart.zoomToRectangle(bounds.left, bounds.top, bounds.right, bounds.bottom);
      //     }
      //   }
      // });

      polygonSeries.mapPolygons.template.events.on("pointerout", function(ev) {
        if (ev.target.series?.chart) {
          chart.goHome();
        }
      });

      

      // polygonSeries.mapPolygons.template.events.on("click", function(ev) {
      //   if (ev.target.dataItem) {
      //     alert(`You clicked on ${ev.target.dataItem.get["name"]}`);
      //   }
      // });

      this.root = root;
    });
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}