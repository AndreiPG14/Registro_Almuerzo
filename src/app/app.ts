import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

import { Data } from './data/data.db';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, ZXingScannerModule, CommonModule, ToastModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers:[MessageService]
})
export class App {
  protected title = 'mvp';

  data = Data
  trabajador: any = null;
  notFound = false;
  dniManual: string = '';
  escaneados: string[] = [];
  @ViewChild('scanner')
  scanner!: ZXingScannerComponent;

  hasDevices?: boolean;
  hasPermission?: boolean;
  qrResultString?: string;
  qrResult?: Result;

  availableDevices?: MediaDeviceInfo[];
  currentDevice?: MediaDeviceInfo;

constructor(private messageService: MessageService) {}

onScan(result: any) {
  const code = result.trim();
  if(this.escaneados.includes(code)){
    Swal.fire({
      icon:'warning',
      title:'Ya fue escaneado',
              text: `El código ${code} ya se registró previamente.`,
              timer:2000

    });
    return
  }

  this.qrResultString = code;
  this.escaneados.push(code);
  this.compararConData(code);

  setTimeout(() => {
    this.qrResultString = '';
  }, 2000);
}


   buscarPorDni() {
    const code = this.dniManual.trim();
    if (!code) return;

    if (this.escaneados.includes(code)) {
      Swal.fire({
        icon: 'warning',
        title: 'Ya fue escaneado',
        text: `El DNI ${code} ya se registró previamente.`,
        timer: 2000
      });
      return;
    }

    this.escaneados.push(code);
    this.compararConData(code);
  }
  compararConData(code: string){
    const found = this.data.find(item => item.IDCODIGOGENERAL.trim() == code);
    this.trabajador = found || null;
    this.notFound = !found;

    if(!found){
     
      Swal.fire({
        title:'Advertencia',
        icon: 'error',
        text:`No se encontró ningún trabajador con el código ${code}`,
        timer:2000
      })
    } else {
       
      Swal.fire({
        title:'Éxito',
        icon: 'success',
        text:`Si se registró ${code}`,
        timer:2000
      })
    }
  }

  displayCameras(cameras: MediaDeviceInfo[]) {
    console.debug('Devices: ', cameras);
    this.availableDevices = cameras;
  }

  handleQrCodeResult(resultString: string) {
    console.debug('Result: ', resultString);
    this.qrResultString = resultString;
  }

  onDeviceSelectChange(selectedValue: string) {
  const selectedDevice = this.availableDevices?.find(d => d.deviceId === selectedValue);
  if (selectedDevice) {
    this.currentDevice = selectedDevice;
    this.scanner.device = selectedDevice;
  }
}
}
