import { Retorno } from "../../Interfaces/ExpressionXquery";

export class EntornoXQuery {

    private variables: Map<string, Retorno>;
    //public funciones: Map<string, InsFuncion>;

    constructor (public anterior: EntornoXQuery | null){
        this.variables = new Map();
    }

    public guaradarVar(id: string, valor: Retorno){
        this.variables.set(id, valor);
    }

    public existeVar (id : string): boolean{
        return this.variables.has(id);
    }

    public actualizarVar(id : string, nvoValor : Retorno){

        for (let entry of Array.from(this.variables.entries())) {
            let key = entry[0];
            if (key === id) {
                entry[1] = nvoValor;
            }
        }
    }

    public getVar(id : string) : Retorno | null{

        for (let entry of Array.from(this.variables.entries())) {
            let key = entry[0];
            if (key === id) {
                return entry[1];
            }
        }
        return null;
    }

}