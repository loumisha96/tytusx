import logo from '../logo.svg';
import { Link } from 'react-router-dom'
import React from 'react';
import {  parse as parseXPath } from '../code/analizadorXPath/Xpath'
import { parse as parseXQuery } from '../code/analizadorXQuery/ascendente';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import { CD3 } from '../code/codigo3D/cd3';
import { XPATHC3D } from '../code/codigo3D/xpathC3D';
import { Entorno } from '../code/analizadorXQuery/Tabla/TablaSimbolos';
import { Error } from '../code/analizadorXQuery/Tabla/Error';

require('../../node_modules/codemirror/mode/xquery/xquery')
require('../../node_modules/codemirror/mode/xml/xml')
require('../../node_modules/codemirror/mode/javascript/javascript')
require('../../node_modules/codemirror/mode/clike/clike')

//const XPath = require('../code/analizadorXPath/Xpath')
const XPathDesc = require('../code/analizadorXPath/XPathDesc')
const grammar = require('../code/analizadorXML/grammar')
const grammarDesc = require('../code/analizadorXMLDesc/grammarDesc')


class Navigation extends React.Component{

    contadorTemporal = null;
    contadorEtiqueta = null;
    heap = null;
    stack = null;
    codigoXml = null;
    codigoXpath = null;
    codigoXquery = null;
    codigoC3D = null;

    constructor(props){
        super(props);

        this.state = {
            fileDownloadUrl:"",
            OutputTextarea: "",
            XMLTextarea: "",
            InputTextarea: "",
            TraductorTextArea: "", 
            resultadoConsulta: [], 
            XML: {
                tipo : '',
                texto : '',
                atributos : [],
                hijos : []
            },
            datosCST: {
                nodes: [
                    { id: 1, label: 'Node 1' },
                    { id: 2, label: 'Node 2' },
                    { id: 3, label: 'Node 3' },
                    { id: 4, label: 'Node 4' },
                    { id: 5, label: 'Node 5' }
                ],
                edges: [
                    { from: 1, to: 2 },
                    { from: 1, to: 3 },
                    { from: 2, to: 4 },
                    { from: 2, to: 5 }
                ]
            },
            datosCSTXML: {
                nodes: [
                    { id: 1, label: 'Node 1' },
                    { id: 2, label: 'Node 2' },
                    { id: 3, label: 'Node 3' },
                    { id: 4, label: 'Node 4' },
                    { id: 5, label: 'Node 5' }
                ],
                edges: [
                    { from: 1, to: 2 },
                    { from: 1, to: 3 },
                    { from: 2, to: 4 },
                    { from: 2, to: 5 }
                ]
            },
            AST:{
                nodes: [
                    { id: 1, label: 'Node 1' },
                    { id: 2, label: 'Node 2' },
                    { id: 3, label: 'Node 3' },
                    { id: 4, label: 'Node 4' },
                    { id: 5, label: 'Node 5' }
                ],
                edges: [
                    { from: 1, to: 2 },
                    { from: 1, to: 3 },
                    { from: 2, to: 4 },
                    { from: 2, to: 5 }
                ]
            },
            graphvizCST:"",
            Mistakes: [],
            MistakesXPath: [],
            TablaGramatical: [],
            TablaGramticalXPath: [], 
            ErroresXQuery: []
        }
        this.fileInput = React.createRef();
        this.fileInput2 = React.createRef();
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    setText(){  // ANALISIS ASCENDENTE XPATH 
        console.log("setText Button clicked");
        let text = this.state.InputTextarea;
        if(text=="") return
        var funcion = parseXPath(text); //XPATH 
        if(funcion.errores.length > 0)
        {
            alert("Se detectaron errores en la entrada :( Xpath")
            console.log(funcion.errores)
        }
        console.log(funcion)
        var respuesta=funcion.Ejecutar(this.state.XML);   // donde esta esta funcion.Ejecutar   // ENTORNO  // 
        var c3dXpath = this.getXpathC3D(respuesta);
        //console.log(c3dXpath);
        this.setState({OutputTextarea: respuesta});  
        //console.log('EN TEORIA DEBO DE GUARDAR', respuesta);
        var AST = funcion.Graficar();
        this.setState({AST:AST})
        funcion.InvertirNodes()
        var datos = {nodes:funcion.Nodos,edges:funcion.Edges}   
        this.setState({datosCST:datos}) 
        this.setState({MistakesXPath: funcion.errores})
        this.setState({TablaGramticalXPath: funcion.tablaGramatica});
       // this.ejecutarConsulta(text); 
    }

 /*   setTextDesc(){  // DESCENDENTE XPATH 
        console.log("setTextDesc Button clicked");
        let text = this.state.InputTextarea;
        if(text=="") return
        var funcion = XPathDesc.parse(text);
        if(funcion.errores.length > 0)
        {
            alert("Se detectaron errores en la entrada :( Xpath")
            console.log(funcion.errores)
        }
        var respuesta=funcion.Ejecutar(this.state.XML);
        this.setState({OutputTextarea: respuesta});  
        var AST = funcion.Graficar();
        this.setState({AST:AST})
        funcion.InvertirNodes()
        var datos = {nodes:funcion.Nodos,edges:funcion.Edges}   
        this.setState({datosCST:datos}) 
        this.setState({graphvizCST:funcion.graphviz})
        this.setState({MistakesXPath: funcion.errores})
        this.setState({TablaGramticalXPath: funcion.tablaGramatica.reverse()});
    }*/

    xmlDesc(){
        var x = this.state.XMLTextarea;
        var resultado = grammarDesc.parse(x);
        if(resultado.errores.length>0)
        {
            alert("Errores en el analisis Desc del XML")
            console.log(resultado.errores);
            return 
        }
        console.log(resultado)
        this.setState({XML:resultado.datos})
        this.setState({datosCSTXML:{nodes:resultado.nodes,edges:resultado.edges}})
        this.setState({Mistakes: resultado.errores})
        this.setState({TablaGramatical: resultado.tabla.reverse()})
    }
 
    actualizar(){ // ANALIZADOR ASCENDENTE XML - Ver como guardan los datos en la tabla de simbolos para la traducción 
        console.log('Hola')
        var x = this.state.XMLTextarea;
        var resultado = grammar.parse(x)
        if(resultado.errores.length>0)
        {
            alert("Errores en el analisis del XML")
            return
        }
        resultado.datos = this.getC3D(resultado.datos); 
        this.setState({XML:resultado.datos}) // resultado.datos estan los objetos // this.state.XML el entorno
        this.setState({datosCSTXML:{nodes:resultado.nodes,edges:resultado.edges}})
        this.setState({Mistakes: resultado.errores})   
        this.setState({TablaGramatical: resultado.tabla})
    }

    getC3D(xml){
        var traducir = new CD3(); 
        var codigo = traducir.getTraduccion(xml); 
        
        this.codigoXml = codigo.traduccion;
        this.codigoC3D = this.getEncabezado() + this.codigoXml;

        //this.setState({TraductorTextArea: codigo.traduccion})
        this.setState({TraductorTextArea: this.codigoC3D})

        this.contadorTemporal = traducir.getTemporal();
        console.log(this.contadorTemporal, `<--------Temp Xml`);

        this.heap = traducir.getHeap();
        console.log(this.heap.hp, `<--------Heap Xml`);

        this.stack = traducir.getStack();
        console.log(this.stack.lista.length, `<--------Stack Xml`);

        return codigo.objeto
    }

    getEncabezado(){
        let traduccion = `/* --- --- --- ENCABEZADO --- --- --- */\n#include <stdio.h> \n#include <math.h>\n`
        traduccion += ` double heap[31110999];\n double stack[31110999];\n double P;\n double H; \n double t0`   
        for (let index = 1; index < this.contadorTemporal; index++) {
            traduccion += `, t${index}`
        }

        traduccion += `; \n\n`

        return traduccion; 
    }

    getXpathC3D(xpath){
        var traducirX = new XPATHC3D();
        var respuesta = traducirX.getXpath(xpath, this.contadorTemporal, this.heap, this.stack);

        //TEMPORAL NUEVO CON XPATH
        this.contadorTemporal = traducirX.getTemporal();
        console.log(this.contadorTemporal, `<--------Temp Xpath`);
        //HEAP NUEVO CON XPATH
        this.heap = traducirX.getHeap();
        console.log(this.heap.hp, `<--------Heap Xpath`);
        //STACK NUEVO CON XPATH
        this.stack = traducirX.getStack();
        console.log(this.stack.lista.length, `<--------Stack Xpath`);

        this.codigoXpath = respuesta;
        this.codigoC3D = this.getEncabezado() + this.codigoXpath + this.codigoXml;

        this.setState({TraductorTextArea: this.codigoC3D})

        return respuesta
    }

    handleOnChange = e => {
        this.setState({
            InputTextarea: e.getValue()
        })
    } 

    handleXML = e => {
        this.setState({
            XMLTextarea: e.getValue()
        })
    }

    descargar()
    {
        if (this.state.XMLTextarea=="") return
        const blob = new Blob([this.state.XMLTextarea])
        const fileDownloadUrl = URL.createObjectURL(blob)
        this.setState({fileDownloadUrl:fileDownloadUrl},
            ()=>{
                this.dofileDownload.click();
                URL.revokeObjectURL(fileDownloadUrl);
                this.setState({fileDownloadUrl: ""})
            }
        )
    }

    fileReader;

    handleSubmit = (event) => {

        this.fileReader = new FileReader();
        this.fileReader.onloadend =  this.handleFileReader;
        this.fileReader.readAsText(event.target.files[0]);
    }

    handleFileReader = (e) => {      // Tambien se ejecuta aqui con el analizador ASCENDENTE XML 
        const content = this.fileReader.result;
        console.log(content);
        this.setState({XMLTextarea: content});
        if(content=="") return
        var resultado = grammar.parse(content)
        console.log(resultado)
        if(resultado.errores.length>0)
        {
            alert("Errores en el analisis del XML")
        }
        resultado.datos = this.getC3D(resultado.datos);
        this.setState({XML:resultado.datos}) // Esto es lo que se envia para ejecutar el XPATH 
        this.setState({datosCSTXML:{nodes:resultado.nodes,edges:resultado.edges}})
        this.setState({Mistakes: resultado.errores})
        this.setState({TablaGramatical: resultado.tabla});
    } 

    fileReader2;

    handleSubmitPath = (event) => {
        this.fileReader2 = new FileReader();
        this.fileReader2.onloadend =  this.handleFileReaderPath;
        this.fileReader2.readAsText(event.target.files[0]);
    }

    handleFileReaderPath = (e) => {
        const content = this.fileReader2.result;
        console.log(content);
        this.setState({InputTextarea: content});
    } 

    handleFocus = (e) =>{
        if(e.getValue()=="") return
        var resultado = grammar.parse(e.getValue())        
        console.log(resultado)
        if(resultado.errores.length>0)
        {
            alert("Errores en el analisis del XML")
        }
        resultado.datos = this.getC3D(resultado.datos);
        this.setState({XML:resultado.datos})
        this.setState({datosCSTXML:{nodes:resultado.nodes,edges:resultado.edges}})
        this.setState({Mistakes: resultado.errores})
        this.setState({TablaGramatical: resultado.tabla});
    }

    ejecutarXQuery(){
        this.setState({OutputTextarea: ''})
        var texto = this.state.InputTextarea;         
        if(texto == "") return  
        var resultado = parseXQuery(texto); 
        console.log(resultado); 
        let consola = ""
        let entornoGlobal = new Entorno(null, 'global')
        if(resultado.instrucciones instanceof Array){
            for(let instruccion of resultado.instrucciones){
                consola += instruccion.getValor(entornoGlobal)
            }
        }else{
            consola =  resultado.instrucciones.getValor(entornoGlobal)
        }
        if(consola instanceof Error){
            consola = 'Se encontraron errores en la ejecución de XQuery'
        }
        this.setState({OutputTextarea: consola}); 
    }




    render(){
        return(
            //tag principal
            <header className="App-header">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        <Link className="nav-link" style={ { textDecoration: 'none' } } to= {{ pathname: "/tytusx/20211SVAC/G31/reporte", datosCST:this.state.datosCST, datosCSTXML:this.state.datosCSTXML, datosAST:this.state.AST ,graphviz:this.state.graphvizCST }}>
                            Arboles
                        </Link>                        
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" style={ { textDecoration: 'none' } } to= {{ pathname: "/tytusx/20211SVAC/G31/reporteTabla", XML:this.state.XML }}>
                            Tabla Simbolos
                        </Link>                         
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" style={ { textDecoration: 'none' } } to= {{ pathname: "/tytusx/20211SVAC/G31/reporteGramatical", TablaGramatical:this.state.TablaGramatical, TablaGramticalXPath: this.state.TablaGramticalXPath }}>
                            Gramaticales
                        </Link>                        
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" style={ { textDecoration: 'none' } } to= {{ pathname: "/tytusx/20211SVAC/G31/reporteErrores", Mistakes:this.state.Mistakes, MistakesXPath:this.state.MistakesXPath }}>
                            Errores
                        </Link>                        
                    </li>
                </ul>
            </nav>

            
                Organización de Lenguajes y Compiladores 2
            <p></p>
            

            <div className="container">
                <div className="row">
                    <div className="col-3">
                        <div className="custom-file">
                            <input  multiple={false} accept=".xml" id="fileinput" className="fileinput" type="file" ref={this.fileInput} onChange={this.handleSubmit}/>
                            <label htmlFor="fileinput">Subir XML</label>
                        </div>
                    </div>
                    <div className="col-3">
                        <a style={{display: "none"}}
                            download={"archivo.xml"}
                            href={this.state.fileDownloadUrl}
                            ref={e=>this.dofileDownload = e}
                        >download it</a>
                        <button className="btn btn-secondary btn-lg" onClick={() => this.descargar()}>Descargar XML</button>
                    </div>
                    <div className="col-6">
                        <div className="custom-file">
                            <input  multiple={false} accept=".xml" id="fileinput2" className="fileinput" type="file" ref={this.fileReader2} onChange={this.handleSubmitPath}/>
                            <label htmlFor="fileinput2">Subir XPath</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <p></p>
                    <p></p>
                </div>
            </div>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-6 block">
                        
                        <div className="row container">
                            <label className="labelClass">Editor de XML </label>
                            {/* <textarea className="Text" placeholder="Bienvenido" defaultValue={this.state.XMLTextarea} onChange={this.handleXML} onBlur={this.handleFocus} /> */}
                            <CodeMirror
                             className="codeMirror"
                             value={this.state.XMLTextarea}
                             options={{
                                mode: 'xml',
                                theme: 'dracula',
                                lineNumbers: true,
                                styleActiveLine: true,
                                columnNumbers:true,
                                inputStyle:'textarea'
                              }}
                             onBlur={this.handleFocus}
                             onChange={this.handleXML}
                             placeholder="Bienvenido"
                             />
                        </div>
                        <div className="row">
                        <p></p>
                            <div className="col-12 block">
                                <button type="button" className="btn btn-primary btn-lg" onClick={ () => this.actualizar() }> Ejecutar XML </button> 
                            </div>
                        </div>
                    </div>
                    <div className="col-6 block">
                        <div className="row container">
                            <label className="labelClass"> Editor de XQUERY / XPATH </label> 
                            <CodeMirror
                             className="codeMirror"
                             value = {this.state.InputTextarea}
                             options={{
                                mode: 'xquery',
                                theme: 'dracula',
                                lineNumbers: true,
                                styleActiveLine: true,
                                lineWrapping: true,
                                columnNumbers:true,
                                foldGutter: true,
                                gutter: true,
                              }}
                             onChange={this.handleOnChange}
                             placeholder="Bienvenido"
                             />
                        </div>
                        <div className="row">
                            <p></p>
                            <div className="col-6 block"> 
                                <button type="submit" className="btn btn-primary btn-lg" onClick={ () => this.setText() }>Ejecutar Ascendente </button>
                            </div>                            
                            <div className="col-6 block">
                                <button type="submit" className="btn btn-primary btn-lg" onClick={ () => this.ejecutarXQuery() }> Ejecutar XQuery </button>
                            </div>
                        </div>

                    </div>                    
                </div>
            </div>
            <div className="container">
            <div className="row">
                        <div className="row container">
                            <label className="labelClass"> Traducción  </label> 
                            <CodeMirror
                             className="codeMirror"
                             value = {this.state.TraductorTextArea}
                             options={{
                                mode: 'clike',
                                theme: 'dracula',
                                lineNumbers: true,
                                styleActiveLine: true,
                                lineWrapping: true,
                                columnNumbers:true,
                                foldGutter: true,
                                gutter: true,
                              }}
                             //onChange={}
                             placeholder="Bienvenido"
                             />
                        </div>
                    </div>    
            </div>
            <div className="container">
                <div className="row">
                    <label className="labelClass"> Consola </label>
                    <div className="text-center">
                        <CodeMirror
                             className="codeMirror"
                             value={this.state.OutputTextarea}
                             options={{
                                mode: 'xml',
                                theme: 'dracula',
                                lineNumbers: true,
                                styleActiveLine: true,
                                lineWrapping: true,
                                columnNumbers:true,
                                foldGutter: true,
                                gutter: true,
                                readOnly:true,
                              }}
                             placeholder="Bienvenido"
                             />
                    </div>
                </div>
            </div>

            <p></p>
            <p></p>
            <p></p>

            <div className="container"></div>

            <footer className="bg-dark text-center text-lg-start">
            <div className="text-center p-3 text-light ">
                <font size="3">
                <p>
                Grupo 31 <br/>
                Jacqueline Méndez - Stefany Coromac <br/>
                Organización de Lenguajes y Compiladores 2<br/>
                Escuela de Vacaciones Junio 2021 ( Fase 2 ) <br/>                
                </p>
                </font>   
            </div>
            </footer>

        </header>
        );
    }
        
}



export default Navigation;