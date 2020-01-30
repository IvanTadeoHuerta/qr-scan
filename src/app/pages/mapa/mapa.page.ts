import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var mapboxgl: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {


  lat: number;
  lng: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {

    let geo: any = this.route.snapshot.paramMap.get('geo');

    geo = geo.substring(4);
    geo = geo.split(',');

    this.lat = geo[0];
    this.lng = geo[1];

    console.log(this.lat, this.lng);

  }

  ngAfterViewInit(): void {

    mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbnRlYzVzZW0iLCJhIjoiY2s1enoxd2tkMDJtbzNqbWdpMmd1cjB2MyJ9.dO2HrOpjVu3S4jLgXYE2Mw';
    
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.lng , this.lat],
      // center: [0 , 0],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });

    map.on('load',  () => {

      map.resize();

      new mapboxgl.Marker()
      .setLngLat([this.lng , this.lat])
      .addTo(map);


      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      },
        labelLayerId
      );
    });

  }

}
