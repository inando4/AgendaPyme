import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {

  constructor() { }

  // Generar código QR como Data URL (base64)
  async generarQR(texto: string): Promise<string> {
    try {
      const qrDataURL = await QRCode.toDataURL(texto, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generando QR:', error);
      return '';
    }
  }

  // Generar link de reserva para un negocio
  generarLinkReserva(negocioId: string): string {
    const baseUrl = window.location.origin; // Obtiene https://localhost:4200
    return `${baseUrl}/reservar/${negocioId}`;
  }

  // Generar código QR para reservas de un negocio
  async generarQRReserva(negocioId: string): Promise<string> {
    const link = this.generarLinkReserva(negocioId);
    return this.generarQR(link);
  }

  // Copiar texto al portapapeles
  async copiarAlPortapapeles(texto: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      return false;
    }
  }

  // Descargar QR como imagen
  descargarQR(qrDataURL: string, nombreArchivo: string = 'codigo-qr.png'): void {
    const link = document.createElement('a');
    link.download = nombreArchivo;
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}