import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
export default function App(){return <BrowserRouter><header><p>Departamento de Parques y Fenómenos Inexplicables de Pawnee</p><nav><Link to="/">Criaturas</Link>{' · '}<Link to="/avistamientos">Avistamientos</Link></nav><hr/></header><main><Routes>
 <Route path="*" element={<p>Página no encontrada. <Link to="/">Volver</Link></p>}/>
 </Routes></main></BrowserRouter>;}
