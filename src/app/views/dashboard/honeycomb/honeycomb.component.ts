import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-honeycomb',
  standalone: true,
  imports: [],
  templateUrl: './honeycomb.component.html',
  styleUrl: './honeycomb.component.scss',
})
export class HoneycombComponent implements OnInit, AfterViewInit, OnDestroy {
  private root!: am5.Root;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.root = am5.Root.new('chartdiv');

    this.root.setThemes([am5themes_Animated.new(this.root)]);

    let chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {})
    );
    chart.gridContainer.set('opacity', 0);

    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 50,
          inside: true,
        }),
        min: 0,
        max: 10,
        strictMinMax: true,
        opacity: 0,
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {
          inside: true,
          inversed: true,
        }),
        min: -1,
        max: 5,
        strictMinMax: true,
        opacity: 0,
      })
    );

    let series = chart.series.push(
      am5xy.LineSeries.new(this.root, {
        calculateAggregates: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'y',
        valueXField: 'x',
        valueField: 'value',
      })
    );

    // Explicitly define the template type to match am5.Line

    let template: am5.Template<am5.Line> = am5.Template.new<am5.Line>({});

    series.bullets.push(() => {
      let graphics = am5.Line.new(
        this.root,
        {
          fill: series.get('fill'),
          tooltipText: '{name} {value}',
          tooltipY: -am5.p50,
          // stroke: am5.color(0x30906a),
          // stroke: am5.color(0x90ee90),
          stroke: am5.color(0xffffff),
          // stroke: am5.color(0xe8e8e8),
          strokeWidth: 4,
        },
        template
      );

      graphics.adapters.add('x', (x, target) => {
        let w = Math.abs(xAxis.getX(0.5, 2, 0.5) - xAxis.getX(1.5, 2, 0.5)) / 4;
        let h = Math.abs(yAxis.getY(0.5, 2, 0.5) - yAxis.getY(1.5, 2, 0.5)) / 4;

        let p0 = { x: 0, y: -h };
        let p1 = { x: w, y: -h / 2 };
        let p2 = { x: w, y: h / 2 };
        let p3 = { x: 0, y: h };
        let p4 = { x: -w, y: h / 2 };
        let p5 = { x: -w, y: -h / 2 };
        let p6 = { x: 0, y: -h };

        target.set('segments', [[[p0, p1, p2, p3, p4, p5, p6]]]);

        return x;
      });

      return am5.Bullet.new(this.root, {
        sprite: graphics,
      });
    });

    series.bullets.push(() => {
      let label = am5.Label.new(this.root, {
        fontFamily: 'Anuphan',
        fontWeight: '600',
        fontStyle: 'normal',
        populateText: true,
        fill: am5.color(0xffffff) , // กำหนดสีฟอนต์เป็นสีเขียว
        centerX: am5.p50,
        centerY: am5.p50,
        text: '{short}',
      });

      return am5.Bullet.new(this.root, {
        sprite: label,
      });
    });

    series.set('heatRules', [
      {
        target: template,
        min: am5.color(0x008000),
        max: am5.color(0x32cd32),
        dataField: 'value',
        key: 'fill',
      },
    ]);

    series.strokes.template.set('strokeOpacity', 0);

    let data = [
      { short: 'สทส', name: 'Alabama', y: 3, x: 2, value: 4849300 },
      { short: 'สกค', name: 'Alaska', y: 1, x: 2, value: 737700 },
      { short: 'สบค', name: 'Arizona', y: 2, x: 2, value: 6745400 },
      { short: 'สนย', name: 'Arkansas', y: 2, x: 4, value: 2994000 },
      { short: 'สสว.1', name: 'California', y: 2, x: 3, value: 39250000 },
      { short: 'สสว.2', name: 'Colorado', y: 2, x: 5, value: 5540500 },
      { short: 'CT', name: 'Connecticut', y: 3, x: 3, value: 3596600 },
      { short: 'DE', name: 'Delaware', y: 3, x: 4, value: 935600 },
      { short: 'DC', name: 'District of Columbia', y: 1, x: 3, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 1, x: 4, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 1, x: 5, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 2, x: 5, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 3, x: 5, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 3, x: 7, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 1, x: 6, value: 672228 },
      { short: 'DC', name: 'District of Columbia', y: 2, x: 6, value: 672 },
      { short: 'DC', name: 'District of Columbia', y: 2, x: 7, value: 67228 },
      { short: 'DC', name: 'District of Columbia', y: 3, x: 6, value: 62228 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 1, value: 72228 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 2, value: 6228 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 3, value: 2228 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 4, value: 228 },
      { short: 'DC', name: 'District of Columbia', y: 3, x: 6, value: 622228 },
      { short: 'DC', name: 'District of Columbia', y: 3, x: 8, value: 67128 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 5, value: 61228 },
      { short: 'DC', name: 'District of Columbia', y: 4, x: 6, value: 172228 },
      { short: 'DC', name: 'District of Columbia', y: 2, x: 8, value: 472228 },
      { short: 'DC', name: 'District of Columbia', y: 1, x: 7, value: 472228 },
    ];

    var vStep = (1 + am5.math.sin(30)) / 2;

    data.forEach(function (di) {
      var dx = 0;
      if (di.y / 2 == Math.round(di.y / 2)) {
        di.x += 0.5;
      }
      // shift y for the hext to stick to each other
      di.y = vStep * di.y;
    });

    series.data.setAll(data);
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}
