import { v4 as uuidv4 } from 'uuid';
import { Cliente } from '../dominio/Entidades/Cliente';
import { ICliente } from '../dominio/ICliente';
import { ejecutarConsulta } from './ClientePostgres';
import { CrearClienteDto, ActualizarClienteDto } from '../dominio/Entidades/Cliente';
import { IClienteRepositorio } from '../dominio/repositorio/IClienteRepositorio';

export class ClienteRepository implements IClienteRepositorio {
  
  private mapearCliente(fila: any): Cliente {
    const datosCliente: ICliente = {
      id: fila.id,
      nombre: fila.nombre,
      email: fila.email,
      telefono: fila.telefono,
      documentoIdentidad: fila.documento_identidad
    };
    return new Cliente(datosCliente);
  }


  async crear(datos: CrearClienteDto): Promise<Cliente> {
    const id = uuidv4();
    const query = `
      INSERT INTO clientes (id, nombre, email, telefono, documento_identidad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const parametros = [
      id, 
      datos.nombre, 
      datos.email, 
      datos.telefono, 
      datos.documentoIdentidad
    ];
    
    const resultado = await ejecutarConsulta(query, parametros);
    return this.mapearCliente(resultado.rows[0]);
  }


  async obtenerTodos(): Promise<Cliente[]> {
    const query = 'SELECT * FROM clientes ORDER BY fecha_creacion DESC';
    const resultado = await ejecutarConsulta(query);
    
    return resultado.rows.map(fila => this.mapearCliente(fila));
  }

  async obtenerPorId(id: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE id = $1';
    const resultado = await ejecutarConsulta(query, [id]);
    
    if (resultado.rows.length === 0) {
      return null;
    }
    
    return this.mapearCliente(resultado.rows[0]);
  }

  async actualizar(id: string, datos: ActualizarClienteDto): Promise<Cliente | null> {

    const mapeoColumnas: { [key: string]: string } = {
      nombre: 'nombre',
      email: 'email',
      telefono: 'telefono',
      documentoIdentidad: 'documento_identidad'
    };

    const columnasActualizar = Object.keys(datos)
      .map(key => mapeoColumnas[key])
      .filter(Boolean);

    if (columnasActualizar.length === 0) {
      return this.obtenerPorId(id);
    }

    const setClause = columnasActualizar
      .map((col, i) => `${col} = $${i + 1}`)
      .join(', ');

    const parametros = Object.values(datos);
    parametros.push(id);

    const query = `
      UPDATE clientes 
      SET ${setClause}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $${parametros.length}
      RETURNING *
    `;

    const resultado = await ejecutarConsulta(query, parametros);
    
    if (resultado.rows.length === 0) {
      return null;
    }
    
    return this.mapearCliente(resultado.rows[0]);
  }

  async eliminar(id: string): Promise<boolean> {
    const query = 'DELETE FROM clientes WHERE id = $1';
    const resultado = await ejecutarConsulta(query, [id]);
    
    return resultado.rowCount !== null && resultado.rowCount > 0;
  }


  async existeEmail(email: string, idExcluir?: string): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM clientes WHERE email = $1';
    const parametros: (string | number | null)[] = [email];
    
    if (idExcluir) {
      query += ' AND id != $2';
      parametros.push(idExcluir);
    }
    
    const resultado = await ejecutarConsulta(query, parametros);
    return parseInt(resultado.rows[0].count) > 0;
  }

  async existeDocumento(documento: string, idExcluir?: string): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM clientes WHERE documento_identidad = $1';
    const parametros: (string | number | null)[] = [documento];
    
    if (idExcluir) {
      query += ' AND id != $2';
      parametros.push(idExcluir);
    }
    
    const resultado = await ejecutarConsulta(query, parametros);
    return parseInt(resultado.rows[0].count) > 0;
  }
}

