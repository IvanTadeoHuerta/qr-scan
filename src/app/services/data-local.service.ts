import { Injectable } from '@angular/core';
import { Registro } from '../models/resgistro.modelo';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx/'
import { EmailComposer } from '@ionic-native/email-composer/ngx';



@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];

  constructor(private storage: Storage, 
    private navCtrl: NavController, 
    private iab: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
    ) { 

   this.cargarStorage();

  }

  async cargarStorage(){
    this.guardados = await this.storage.get('registros') || [];
  }


  abrirRegistro( registro: Registro ){

    this.navCtrl.navigateForward('/tabs/tab2');

    switch( registro.type  ){

      case 'http':
        this.iab.create( registro.text, '_sys' );
        break;

      case 'geo':
        this.navCtrl.navigateForward('/tabs/tab2/mapa/' + registro.text);
        break;

    }

  }

  guardarRegistro( formato: string, text: string ){

    const nuevoRegistro = new Registro(formato,text );
    this.guardados.unshift( nuevoRegistro );
    this.storage.set('registros', this.guardados);

    this.abrirRegistro( nuevoRegistro );

  }


  enviarCorreo(){
  
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push( titulos );

    this.guardados.forEach( registro =>{

      const linea = `${ registro.type }, ${ registro.format}, ${ registro.created}, ${ registro.text.replace(',',' ')}\n`;

      arrTemp.push( linea );

    });

    this.crearArchivoFisico( arrTemp.join('') );


  }

  crearArchivoFisico( text: string ){

    this.file.checkFile( this.file.dataDirectory , 'registros.csv')
      .then( existe => {
        console.log('existe archivo', existe );
        return this.escribirEnArchivo( text );
      })
      .catch( err =>{

        return this.file.createFile( this.file.dataDirectory , 'registros.csv', false )
                .then( creado => this.escribirEnArchivo( text))
                .catch( err2 => console.log('No se pudo crear archivo', err2));

      });



  }

  async escribirEnArchivo( text: string ){

    await this.file.writeExistingFile( this.file.dataDirectory, 'registros.csv', text);

    console.log( 'Archivo creado ');

    let email = {
      to: 'ivantec5sem@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        // 'file://img/logo.png',
        // 'res://icon.png',
        // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
        // 'file://README.pdf'
        this.file.dataDirectory + '/registros.csv'
      ],
      subject: 'Backu de scans',
      body: 'Aquí tienen sus backups de los scan - <strong> SCAN APP  </strong>',
      isHtml: true
    };

    this.emailComposer.open(email);

  }





}
