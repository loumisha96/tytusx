class ConsultaDescendente2 extends ConsultaSimple {
    run(entornos) {
        let newEntornos = new Array();
        entornos.forEach(e => {
            this.busquedaDescendente(e, newEntornos);
        });
        return newEntornos;
    }
    busquedaDescendente(entorno, newEntornos) {
        let flag = false;
        let nuevoEntorno = new Entorno(entorno.getAnterior());
        entorno.getTable().forEach(s => {
            if (s instanceof Nodo) {
                if (super.getIdentificador() === "*") {
                    flag = true;
                    nuevoEntorno.add(s);
                }
                else if (s.getNombre() === super.getIdentificador()) {
                    flag = true;
                    nuevoEntorno.add(s);
                }
            }
        });
        if (flag) {
            newEntornos.push(nuevoEntorno);
        }
        entorno.getTable().forEach(s => {
            if (s instanceof Nodo) {
                this.busquedaDescendente(s.getEntorno(), newEntornos);
            }
        });
    }
}
