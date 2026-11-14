import { afterEach, describe, expect, it, vi } from 'vitest';
import { validarDatosPartida } from './partida';

const MSG_DURACION = 'duracionMinutos debe ser mayor que 0';
const MSG_FECHA = 'La fecha de la partida no puede ser futura';
const CINCO_MIN_MS = 5 * 60 * 1000;

// Ecuador es UTC-5 todo el año. Se construyen instantes con desfase explícito.
const en = (dia: string, hora = '10:00:00') => new Date(`${dia}T${hora}-05:00`);

// Jueves 12 de noviembre de 2026, 12:00 en Ecuador.
const AHORA = en('2026-11-12', '12:00:00');
const despues = (ms: number) => new Date(AHORA.getTime() + ms);

afterEach(() => {
  vi.useRealTimers();
});

describe('validarDatosPartida: duracionMinutos (CA-28)', () => {
  it('duración 0 se rechaza', () => {
    expect(validarDatosPartida({ duracionMinutos: 0 }, AHORA)).toEqual([MSG_DURACION]);
  });

  it('duración negativa se rechaza', () => {
    expect(validarDatosPartida({ duracionMinutos: -30 }, AHORA)).toEqual([MSG_DURACION]);
  });

  it('duración positiva es válida', () => {
    expect(validarDatosPartida({ duracionMinutos: 90 }, AHORA)).toEqual([]);
  });

  it('una duración fraccionaria mayor que 0 es válida', () => {
    expect(validarDatosPartida({ duracionMinutos: 0.5 }, AHORA)).toEqual([]);
  });
});

describe('validarDatosPartida: fecha (CA-29)', () => {
  it('una fecha pasada es válida', () => {
    expect(validarDatosPartida({ fecha: en('2026-11-10') }, AHORA)).toEqual([]);
  });

  it('una fecha igual a la hora actual es válida', () => {
    expect(validarDatosPartida({ fecha: AHORA }, AHORA)).toEqual([]);
  });

  it('una fecha una hora en el futuro se rechaza', () => {
    expect(validarDatosPartida({ fecha: despues(60 * 60 * 1000) }, AHORA)).toEqual([
      MSG_FECHA,
    ]);
  });

  it('una fecha 2 minutos en el futuro entra en la tolerancia', () => {
    expect(validarDatosPartida({ fecha: despues(2 * 60 * 1000) }, AHORA)).toEqual([]);
  });

  it('una fecha exactamente 5 minutos en el futuro es válida', () => {
    expect(validarDatosPartida({ fecha: despues(CINCO_MIN_MS) }, AHORA)).toEqual([]);
  });

  it('una fecha 1 ms después del límite de 5 minutos se rechaza', () => {
    expect(validarDatosPartida({ fecha: despues(CINCO_MIN_MS + 1) }, AHORA)).toEqual([
      MSG_FECHA,
    ]);
  });
});

describe('validarDatosPartida: campos parciales y combinados', () => {
  it('sin campos no hay errores', () => {
    expect(validarDatosPartida({}, AHORA)).toEqual([]);
  });

  it('solo fecha: no se revisa la duración', () => {
    expect(validarDatosPartida({ fecha: en('2026-11-10') }, AHORA)).toEqual([]);
  });

  it('solo duración: no se revisa la fecha', () => {
    expect(validarDatosPartida({ duracionMinutos: 45 }, AHORA)).toEqual([]);
  });

  it('datos válidos completos devuelven lista vacía', () => {
    expect(
      validarDatosPartida({ fecha: en('2026-11-11'), duracionMinutos: 60 }, AHORA)
    ).toEqual([]);
  });

  it('duración y fecha inválidas devuelven ambos mensajes, duración primero', () => {
    expect(
      validarDatosPartida(
        { fecha: despues(60 * 60 * 1000), duracionMinutos: 0 },
        AHORA
      )
    ).toEqual([MSG_DURACION, MSG_FECHA]);
  });
});

describe('validarDatosPartida: no usa el reloj del sistema', () => {
  it('con el reloj fijado en otra fecha, el resultado depende solo de ahora', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    expect(validarDatosPartida({ fecha: en('2026-11-10') }, AHORA)).toEqual([]);
    expect(validarDatosPartida({ fecha: despues(60 * 60 * 1000) }, AHORA)).toEqual([
      MSG_FECHA,
    ]);

    vi.setSystemTime(new Date('2000-01-01T00:00:00Z'));
    expect(validarDatosPartida({ fecha: en('2026-11-10') }, AHORA)).toEqual([]);
    expect(validarDatosPartida({ fecha: despues(60 * 60 * 1000) }, AHORA)).toEqual([
      MSG_FECHA,
    ]);
  });
});
