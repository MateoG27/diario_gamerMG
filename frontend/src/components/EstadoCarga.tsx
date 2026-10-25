import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export function EstadoCarga({cargando,error,vacio=false}:{cargando:boolean;error:string|null;vacio?:boolean}){
 if(cargando)return <p role="status" className="flex items-center justify-center gap-3 py-16 text-cyan-300"><Loader2 className="h-6 w-6 animate-spin"/>Cargando...</p>;
 if(error)return <p role="alert" className="flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-300 shadow-[0_0_20px_rgb(239_68_68/0.15)]"><AlertTriangle className="h-5 w-5 shrink-0"/>Error: {error}</p>;
 if(vacio)return <p className="flex flex-col items-center gap-2 py-16 text-zinc-400"><Inbox className="h-10 w-10 text-zinc-600"/>No hay resultados para esta consulta.</p>;
 return null;
}
