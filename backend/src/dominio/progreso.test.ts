import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcularProgresoSemanal,
  calcularRacha,
  diaEcuador,
  estadoHitos,
  semanaEcuador,
} from './progreso';

// Ecuador es UTC-5 todo el año. Se construyen instantes con desfase explícito.
const en = (dia: string, hora = '10:00:00') => new Date(`${dia}T${hora}-05:00`);

// Jueves 12 de noviembre de 2026, 12:00 en Ecuador. Semana: 2026-11-09 a 2026-11-15.
const AHORA = en('2026-11-12', '12:00:00');

describe('diaEcuador', () => {
  it('usa el día de Ecuador y no el día UTC (21:00 Ecuador sigue siendo el 12)', () => {
    expect(diaEcuador(new Date('2026-11-13T02:00:00Z'))).toBe('2026-11-12');
  });

  it('el primer segundo del día en Ecuador pertenece a ese día', () => {
    expect(diaEcuador(new Date('2026-11-16T05:00:00Z'))).toBe('2026-11-16');
  });

  it('el último segundo del día en Ecuador pertenece a ese día', () => {
    expect(diaEcuador(new Date('2026-11-16T04:59:59Z'))).toBe('2026-11-15');
  });
});

describe('semanaEcuador', () => {
  it('un jueves devuelve el lunes y el domingo de esa semana', () => {
    expect(semanaEcuador(AHORA)).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' });
  });

  it('el lunes 00:00 pertenece a su propia semana', () => {
    expect(semanaEcuador(en('2026-11-09', '00:00:00'))).toEqual({
      inicio: '2026-11-09',
      fin: '2026-11-15',
    });
  });

  it('el domingo 23:59:59 es el último segundo de la semana', () => {
    expect(semanaEcuador(new Date('2026-11-16T04:59:59Z'))).toEqual({
      inicio: '2026-11-09',
      fin: '2026-11-15',
    });
  });

  it('el lunes 00:00 siguiente inicia la semana nueva', () => {
    expect(semanaEcuador(new Date('2026-11-16T05:00:00Z'))).toEqual({
      inicio: '2026-11-16',
      fin: '2026-11-22',
    });
  });

  it('a las 21:00 del jueves (día UTC ya es el 13) sigue en la misma semana', () => {
    expect(semanaEcuador(new Date('2026-11-13T02:00:00Z'))).toEqual({
      inicio: '2026-11-09',
      fin: '2026-11-15',
    });
  });
});

describe('calcularProgresoSemanal', () => {
  it('CA-04: suma solo la semana actual y cumple con horas y días', () => {
    const partidas = [
      { fecha: en('2026-11-08', '20:00:00'), duracionMinutos: 120 }, // semana anterior
      { fecha: en('2026-11-09', '09:00:00'), duracionMinutos: 60 },
      { fecha: en('2026-11-11', '09:00:00'), duracionMinutos: 120 },
      { fecha: en('2026-11-12', '09:00:00'), duracionMinutos: 120 },
      { fecha: en('2026-11-16', '00:00:00'), duracionMinutos: 120 }, // semana siguiente
    ];
    expect(calcularProgresoSemanal(partidas, { horasSemana: 5, diasSemana: 3 }, AHORA)).toEqual({
      horasJugadas: 5,
      diasJugados: 3,
      porcentajeHoras: 100,
      cumplida: true,
    });
  });

  it('CA-04: con horas completas pero días insuficientes no está cumplida', () => {
    const partidas = [
      { fecha: en('2026-11-10'), duracionMinutos: 150 },
      { fecha: en('2026-11-12', '08:00:00'), duracionMinutos: 150 },
    ];
    const r = calcularProgresoSemanal(partidas, { horasSemana: 5, diasSemana: 3 }, AHORA);
    expect(r.porcentajeHoras).toBe(100);
    expect(r.diasJugados).toBe(2);
    expect(r.cumplida).toBe(false);
  });

  it('CA-04: con días completos pero horas insuficientes no está cumplida', () => {
    const partidas = [
      { fecha: en('2026-11-09'), duracionMinutos: 50 },
      { fecha: en('2026-11-10'), duracionMinutos: 50 },
      { fecha: en('2026-11-11'), duracionMinutos: 50 },
    ];
    const r = calcularProgresoSemanal(partidas, { horasSemana: 5, diasSemana: 3 }, AHORA);
    expect(r.diasJugados).toBe(3);
    expect(r.porcentajeHoras).toBe(50);
    expect(r.cumplida).toBe(false);
  });

  it('CA-05: partida del domingo 23:30 de 90 min cuenta completa en el domingo y en esa semana', () => {
    const domingoNoche = new Date('2026-11-16T04:30:00Z'); // domingo 15, 23:30 Ecuador
    const ahoraDomingo = en('2026-11-15', '23:50:00');
    const r = calcularProgresoSemanal(
      [{ fecha: domingoNoche, duracionMinutos: 90 }],
      { horasSemana: 5, diasSemana: 3 },
      ahoraDomingo
    );
    expect(r.horasJugadas).toBe(1.5);
    expect(r.diasJugados).toBe(1);
  });

  it('CA-05: esa misma partida no cuenta en la semana siguiente', () => {
    const domingoNoche = new Date('2026-11-16T04:30:00Z');
    const r = calcularProgresoSemanal(
      [{ fecha: domingoNoche, duracionMinutos: 90 }],
      { horasSemana: 5, diasSemana: 3 },
      en('2026-11-16', '10:00:00')
    );
    expect(r.horasJugadas).toBe(0);
    expect(r.diasJugados).toBe(0);
  });

  it('CA-06: meta superada limita el porcentaje a 100, conserva las horas reales y no cumple si faltan días', () => {
    const partidas = [
      { fecha: en('2026-11-10'), duracionMinutos: 200 },
      { fecha: en('2026-11-11'), duracionMinutos: 220 },
    ];
    expect(calcularProgresoSemanal(partidas, { horasSemana: 5, diasSemana: 3 }, AHORA)).toEqual({
      horasJugadas: 7,
      diasJugados: 2,
      porcentajeHoras: 100,
      cumplida: false,
    });
  });

  it('CA-09: varias partidas el mismo día cuentan un día y suman sus minutos', () => {
    const partidas = [
      { fecha: en('2026-11-12', '08:00:00'), duracionMinutos: 30 },
      { fecha: en('2026-11-12', '12:00:00'), duracionMinutos: 45 },
      { fecha: en('2026-11-12', '20:00:00'), duracionMinutos: 45 },
    ];
    const r = calcularProgresoSemanal(partidas, { horasSemana: 5, diasSemana: 3 }, AHORA);
    expect(r.diasJugados).toBe(1);
    expect(r.horasJugadas).toBe(2);
  });

  it('el porcentaje es entero redondeado hacia abajo y solo llega a 100 con las horas completas', () => {
    const meta = { horasSemana: 5, diasSemana: 1 };
    const casi = calcularProgresoSemanal(
      [{ fecha: en('2026-11-10'), duracionMinutos: 299 }],
      meta,
      AHORA
    );
    expect(casi.porcentajeHoras).toBe(99);
    expect(casi.cumplida).toBe(false);

    const justo = calcularProgresoSemanal(
      [{ fecha: en('2026-11-10'), duracionMinutos: 300 }],
      meta,
      AHORA
    );
    expect(justo.porcentajeHoras).toBe(100);
    expect(justo.cumplida).toBe(true);

    const fraccion = calcularProgresoSemanal(
      [{ fecha: en('2026-11-10'), duracionMinutos: 100 }],
      { horasSemana: 3, diasSemana: 1 },
      AHORA
    );
    expect(fraccion.porcentajeHoras).toBe(55); // 55,55... hacia abajo
  });

  it('horasJugadas se devuelve con un decimal', () => {
    const r = calcularProgresoSemanal(
      [{ fecha: en('2026-11-10'), duracionMinutos: 100 }],
      { horasSemana: 5, diasSemana: 1 },
      AHORA
    );
    expect(r.horasJugadas).toBe(1.7);
  });

  it('sin meta: porcentaje y cumplida son null, pero horas y días se calculan', () => {
    const partidas = [
      { fecha: en('2026-11-10'), duracionMinutos: 90 },
      { fecha: en('2026-11-11'), duracionMinutos: 90 },
    ];
    expect(calcularProgresoSemanal(partidas, null, AHORA)).toEqual({
      horasJugadas: 3,
      diasJugados: 2,
      porcentajeHoras: null,
      cumplida: null,
    });
  });

  it('CA-20: las mismas partidas se miden contra la meta que esté activa', () => {
    const partidas = [
      { fecha: en('2026-11-10'), duracionMinutos: 60 },
      { fecha: en('2026-11-11'), duracionMinutos: 60 },
    ];
    const metaVieja = calcularProgresoSemanal(partidas, { horasSemana: 2, diasSemana: 2 }, AHORA);
    const metaNueva = calcularProgresoSemanal(partidas, { horasSemana: 4, diasSemana: 2 }, AHORA);
    expect(metaVieja.porcentajeHoras).toBe(100);
    expect(metaVieja.cumplida).toBe(true);
    expect(metaNueva.porcentajeHoras).toBe(50);
    expect(metaNueva.cumplida).toBe(false);
  });

  it('sin partidas: 0 horas, 0 días, 0 por ciento y no cumplida', () => {
    expect(calcularProgresoSemanal([], { horasSemana: 5, diasSemana: 3 }, AHORA)).toEqual({
      horasJugadas: 0,
      diasJugados: 0,
      porcentajeHoras: 0,
      cumplida: false,
    });
  });
});

describe('calcularRacha', () => {
  it('CA-07: última partida ayer y hoy sin jugar, la racha sigue contando', () => {
    const partidas = [{ fecha: en('2026-11-10') }, { fecha: en('2026-11-11') }];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 2 });
  });

  it('racha que termina hoy cuenta hoy', () => {
    const partidas = [{ fecha: en('2026-11-11') }, { fecha: en('2026-11-12', '08:00:00') }];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 2 });
  });

  it('CA-08: última partida anteayer da racha actual 0 y conserva la mejor', () => {
    const partidas = [
      { fecha: en('2026-11-08') },
      { fecha: en('2026-11-09') },
      { fecha: en('2026-11-10') },
    ];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 0, mejor: 3 });
  });

  it('CA-08: última partida mucho antes da racha actual 0 y conserva la mejor', () => {
    const partidas = [{ fecha: en('2026-10-01') }, { fecha: en('2026-10-02') }];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 0, mejor: 2 });
  });

  it('CA-09: varias partidas el mismo día cuentan un solo día de racha', () => {
    const partidas = [
      { fecha: en('2026-11-11', '08:00:00') },
      { fecha: en('2026-11-11', '20:00:00') },
      { fecha: en('2026-11-12', '08:00:00') },
      { fecha: en('2026-11-12', '09:00:00') },
    ];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 2 });
  });

  it('CA-10: sin partidas la racha actual y la mejor son 0', () => {
    expect(calcularRacha([], AHORA)).toEqual({ actual: 0, mejor: 0 });
  });

  it('CA-11: jugar un día nuevo que continúa la racha sube la actual y actualiza la mejor', () => {
    const base = [
      { fecha: en('2026-11-01') },
      { fecha: en('2026-11-02') },
      { fecha: en('2026-11-10') },
      { fecha: en('2026-11-11') },
    ];
    expect(calcularRacha(base, AHORA)).toEqual({ actual: 2, mejor: 2 });

    const conHoy = [...base, { fecha: en('2026-11-12', '09:00:00') }];
    expect(calcularRacha(conHoy, AHORA)).toEqual({ actual: 3, mejor: 3 });
  });

  it('conserva la mejor racha histórica cuando es mayor que la actual', () => {
    const partidas = [
      { fecha: en('2026-11-01') },
      { fecha: en('2026-11-02') },
      { fecha: en('2026-11-03') },
      { fecha: en('2026-11-04') },
      { fecha: en('2026-11-05') },
      { fecha: en('2026-11-11') },
      { fecha: en('2026-11-12', '09:00:00') },
    ];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 5 });
  });

  it('no depende del orden de las partidas', () => {
    const partidas = [
      { fecha: en('2026-11-12', '09:00:00') },
      { fecha: en('2026-11-10') },
      { fecha: en('2026-11-11') },
    ];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 3, mejor: 3 });
  });

  it('un día con hueco rompe la racha', () => {
    const partidas = [{ fecha: en('2026-11-09') }, { fecha: en('2026-11-11') }, { fecha: en('2026-11-12', '09:00:00') }];
    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 2 });
  });

  it('usa el día de Ecuador: 21:00 Ecuador (día UTC siguiente) y el día después forman racha de 2', () => {
    const partidas = [
      { fecha: new Date('2026-11-13T02:00:00Z') }, // jueves 12, 21:00 Ecuador
      { fecha: en('2026-11-13', '08:00:00') },
    ];
    expect(calcularRacha(partidas, en('2026-11-13', '12:00:00'))).toEqual({ actual: 2, mejor: 2 });
  });

  it('la racha cruza el cambio de mes', () => {
    const partidas = [{ fecha: en('2026-10-31') }, { fecha: en('2026-11-01') }];
    expect(calcularRacha(partidas, en('2026-11-01', '12:00:00'))).toEqual({ actual: 2, mejor: 2 });
  });
});

describe('estadoHitos', () => {
  it('CA-12: el hito se alcanza cuando el avance es igual a su porcentaje', () => {
    expect(estadoHitos([50], 50)).toEqual([{ porcentaje: 50, alcanzado: true }]);
  });

  it('CA-12: el hito se alcanza cuando el avance es mayor', () => {
    expect(estadoHitos([50], 80)).toEqual([{ porcentaje: 50, alcanzado: true }]);
  });

  it('CA-13: el hito queda pendiente cuando el avance es menor', () => {
    expect(estadoHitos([50], 49)).toEqual([{ porcentaje: 50, alcanzado: false }]);
  });

  it('CA-14: si el avance baja, el hito vuelve a pendiente', () => {
    expect(estadoHitos([50], 60)).toEqual([{ porcentaje: 50, alcanzado: true }]);
    expect(estadoHitos([50], 40)).toEqual([{ porcentaje: 50, alcanzado: false }]);
  });

  it('CA-15: un hito con porcentaje ya superado aparece alcanzado', () => {
    expect(estadoHitos([25, 75], 60)).toEqual([
      { porcentaje: 25, alcanzado: true },
      { porcentaje: 75, alcanzado: false },
    ]);
  });

  it('CA-18: devuelve los hitos ordenados de menor a mayor', () => {
    expect(estadoHitos([75, 25, 50], 50)).toEqual([
      { porcentaje: 25, alcanzado: true },
      { porcentaje: 50, alcanzado: true },
      { porcentaje: 75, alcanzado: false },
    ]);
  });

  it('con avance 0 ningún hito está alcanzado', () => {
    expect(estadoHitos([1, 100], 0)).toEqual([
      { porcentaje: 1, alcanzado: false },
      { porcentaje: 100, alcanzado: false },
    ]);
  });

  it('sin hitos devuelve una lista vacía', () => {
    expect(estadoHitos([], 80)).toEqual([]);
  });

  it('no modifica el arreglo recibido', () => {
    const entrada = [75, 25, 50];
    estadoHitos(entrada, 50);
    expect(entrada).toEqual([75, 25, 50]);
  });
});

describe('las funciones de dominio no usan el reloj del sistema', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('con el reloj en otra fecha, el resultado depende solo de ahora', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));

    expect(semanaEcuador(AHORA)).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' });

    const partidas = [
      { fecha: en('2026-11-11'), duracionMinutos: 120 },
      { fecha: en('2026-11-12', '09:00:00'), duracionMinutos: 60 },
    ];
    expect(calcularProgresoSemanal(partidas, { horasSemana: 3, diasSemana: 2 }, AHORA)).toEqual({
      horasJugadas: 3,
      diasJugados: 2,
      porcentajeHoras: 100,
      cumplida: true,
    });

    expect(calcularRacha(partidas, AHORA)).toEqual({ actual: 2, mejor: 2 });
  });
});
