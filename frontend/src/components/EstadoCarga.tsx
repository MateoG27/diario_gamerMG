export function EstadoCarga({cargando,error,vacio=false}:{cargando:boolean;error:string|null;vacio?:boolean}){
 if(cargando)return <p role="status">Cargando...</p>;
 if(error)return <p role="alert">Error: {error}</p>;
 if(vacio)return <p>No hay resultados para esta consulta.</p>;
 return null;
}
