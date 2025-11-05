import { v4 as uuidv4 } from 'uuid';
import { Cliente } from '../dominio/Entidades/Cliente';
import { ICliente } from '../dominio/ICliente';
import { ejecutarConsulta } from './ClientePostgres';
import { CrearClienteDto, ActualizarClienteDto } from '../dominio/Entidades/Cliente';
import { IClienteRepositorio } from '../dominio/repositorio/IClienteRepositorio';

export class ClienteRepository implements IClienteRepositorio {


  private mapearCliente(fila: any): Cliente {
    const datosCliente: ICliente = {
      idCliente: fila.id_cliente,
      nombreCliente: fila.nombre_cliente,
      apellidoCliente: fila.apellido_cliente,
      emailCliente: fila.email_cliente,
      telefonoCliente: fila.telefono_cliente,
      documentoCliente: fila.documento_cliente
    };
    return new Cliente(datosCliente);
  }


  async crearCliente(datosCliente: CrearClienteDto): Promise<Cliente> {
    const idCliente = uuidv4();
    const query = `
      INSERT INTO clientes (id_cliente, nombre_cliente, apellido_cliente, email_cliente, telefono_cliente, documento_cliente)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const parametros = [
      idCliente, 
      datosCliente.nombreCliente, 
      datosCliente.apellidoCliente,
      datosCliente.emailCliente, 
      datosCliente.telefonoCliente, 
      datosCliente.documentoCliente
    ];
    
    const resultado = await ejecutarConsulta(query, parametros);
    return this.mapearCliente(resultado.rows[0]);
  }


  async obtenerClientes(): Promise<Cliente[]> {
    const query = 'SELECT * FROM clientes ORDER BY nombre_cliente ASC';
    const resultado = await ejecutarConsulta(query);
    
    return resultado.rows.map(fila => this.mapearCliente(fila));
  }
 
  async obtenerClientePorId(idCliente: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE id_cliente = $1';
    const resultado = await ejecutarConsulta(query, [idCliente]);
    
    if (resultado.rows.length === 0) {
      return null;
    }
    
    return this.mapearCliente(resultado.rows[0]);
  }

  async actualizarCliente(idCliente: string, datosCliente: ActualizarClienteDto): Promise<Cliente | null> {

    const mapeoColumnas: { [key: string]: string } = {
      nombreCliente: 'nombre_cliente',
      apellidoCliente: 'apellido_cliente',
      emailCliente: 'email_cliente',
      telefonoCliente: 'telefono_cliente',
      documentoCliente: 'documento_cliente'
    };

    const campos = Object.entries(datosCliente)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => ({
        columna: mapeoColumnas[key],
        valor: value
      }));

    if (campos.length === 0) {
      return this.obtenerClientePorId(idCliente);
    }

    const setClause = campos
      .map((campo, i) => `${campo.columna} = $${i + 1}`)
      .join(', ');

    const parametros = campos.map(c => c.valor);
    parametros.push(idCliente);

    const query = `
      UPDATE clientes
      SET ${setClause}
      WHERE id_cliente = $${parametros.length}
      RETURNING *
    `;

    const resultado = await ejecutarConsulta(query, parametros);

    if (resultado.rows.length === 0) {
      return null;
    }

    return this.mapearCliente(resultado.rows[0]);
  }

  async eliminarCliente(idCliente: string): Promise<boolean> {
    const query = 'DELETE FROM clientes WHERE id_cliente = $1';
    const resultado = await ejecutarConsulta(query, [idCliente]);
    
    return resultado.rowCount !== null && resultado.rowCount > 0;
  }


  async existeEmailCliente(emailCliente: string, idExcluir?: string): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM clientes WHERE email_cliente = $1';
    const parametros: (string | number | null)[] = [emailCliente];
    
    if (idExcluir) {
      query += ' AND id_cliente != $2';
      parametros.push(idExcluir);
    }
    
    const resultado = await ejecutarConsulta(query, parametros);
    return parseInt(resultado.rows[0].count) > 0;
  }

  async existeDocumentoCliente(documentoCliente: string, idExcluir?: string): Promise<boolean> {
    let query = 'SELECT COUNT(*) FROM clientes WHERE documento_cliente = $1';
    const parametros: (string | number | null)[] = [documentoCliente];
    
    if (idExcluir) {
      query += ' AND id_cliente != $2';
      parametros.push(idExcluir);
    }
    
    const resultado = await ejecutarConsulta(query, parametros);
    return parseInt(resultado.rows[0].count) > 0;
  }
}

