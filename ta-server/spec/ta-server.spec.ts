import request = require("request-promise");
import { Turma } from "../../common/turma";

var base_url = "http://localhost:3000/";
let descricaoTurma = 'ESS';
var notUrl = "http://localhost:3000/notificacoes/resultado-final";

describe("O servidor", () => {
    var server:any;
    beforeAll(() => {server = require('../ta-server')});
    afterAll(() => {server.closeServer()});

    it('retorna resumos de turmas', () => {
        const descricoes: string = [ '2017.2', '2019.1' ].join(',');
        const resposta: any = [
            { descricao: '2017.2', media: 6.7, reprovacao: 0.3 },
            { descricao: '2019.1', media: 6.8, reprovacao: 0.1 }
        ];

        const options: any = {
            uri: base_url + 'relatorios/comparacao-de-desempenho',
            qs: {
                'turmas': descricoes
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };

        return request(options)
            .then(res => {
                expect(res).toEqual(resposta);
            })
            .catch(err => {
                expect(err).toBeNull();
            });
    });
  
    it("envia emails para os alunos", () => {
        var options:any = {method: 'POST', uri: (base_url + "notificacoes/auto-avaliacao"), body:[{email: 'joao@cin.ufpe.br', meta: ['Requisitos', 'Refatoração']}], json: true};
        return request(options)
            .then(body => 
                expect(body).toEqual({success: 'Notificações foram enviadas'})
            )
            .catch(e => 
                expect(e).toEqual(null)
            );
    })

  it("retorna turma com base na descricao", () => {
    var turmaJson = '{"descricao":"ESS 2018.1","metas":["Requisitos","Gerência de Configuração","Testes"],"matriculas":[],"roteiros":[],"monitores":[],"numeroMatriculas":0}'


    return request.get(base_url + "turmas/ESS%202018.1")
            .then(body => {
               console.log("OLHA O BODYYYYY: " + body)
               expect(body).toBe(turmaJson)
            })
            .catch(e => {
                console.log("OLHA O BODYYYYY: " + e)
               expect(e).toEqual(null)
            });
  })

  it("cadastro de roteiros", () => {
    var options:any = {method: 'POST', uri: (base_url + "roteiros"), body:{descricao:"Roteiro de testes", blocos:[]}, json: true};
    return request(options)
             .then(body =>
                expect(body).toEqual({success: "O roteiro foi cadastrado com sucesso"})
             ).catch(e =>
                expect(e).toEqual(null)
             )
  });

  it("não cadastra roteiros com mesmo nome", () => {
    var roteiro1: any = { "descricao": "Roteiro de requisitos", "blocos": [{ "tipo": "Sequencial", "questoes": [] }] };
    var roteiro2: any = { "descricao": "Roteiro de requisitos", "blocos": [{ "tipo": "Paralelo", "questoes": [] }] };

    return request.post(base_url + "roteiros", { json: roteiro1 })
             .then(body => {
                expect(body).toEqual({success: "O roteiro foi cadastrado com sucesso"});
                 return request.post(base_url + "roteiros", { json: roteiro2 })
                         .then(body => {
                            expect(body).toEqual({failure: "O roteiro não pode ser cadastrado"});
                            return request.get(base_url + "roteiros")
                                     .then(body => {
                                        expect(JSON.parse(body)).toContain(roteiro1);
                                        expect(JSON.parse(body)).not.toContain(roteiro2);
                                      });
                          });
              })
              .catch(err => {
                 expect(err).toEqual(null)
              });
 })

    it("retorna uma lista de metas de uma turma", () => {

    let res = '["gerencia de configuração","refatorar código com qualidade","entender requisitos","especificar requisitos","elicitar requisitos"]';

    return request.get(base_url + `turmas/${descricaoTurma.toString().toLowerCase()}/metas`)
            .then(body => {

               expect(body).toContain(res)
            }
             )
            .catch(e => 
               expect(e).toEqual(null)
             );
    })

    it("retorna turma com base na descricao", () => {
        var turmaJson = '{"descricao":"ESS 2020.1","metas":[],"matriculas":[{"avaliacoes":[],"autoAvaliacoes":[{"meta":"testes","nota":"MPA"},{"meta":"requisitos","nota":"MANA"},{"meta":"Gerencia de Projetos","nota":"MA"}],"respostasDeRoteiros":[],"aluno":{"nome":"Carlos Eduardo","cpf":"123","email":"c@gmail"}},{"avaliacoes":[],"autoAvaliacoes":[{"meta":"testes","nota":"MPA"},{"meta":"requisitos","nota":"MANA"},{"meta":"Gerencia de Projetos","nota":""}],"respostasDeRoteiros":[],"aluno":{"nome":"Carimbo da Silva","cpf":"321","email":"cs@gmail"}},{"avaliacoes":[],"autoAvaliacoes":[{"meta":"Gerencia de Projetos","nota":""},{"meta":"Gerencia de Projetos","nota":""},{"meta":"Gerencia de Projetos","nota":""}],"respostasDeRoteiros":[],"aluno":{"nome":"Macaule Cauque","cpf":"231","email":"m@gmail"}}],"roteiros":[],"monitores":[],"numeroMatriculas":0}'
        

        return request.get(base_url + "turmas/ESS%202020.1")
                .then(body => {
                   expect(body).toBe(turmaJson)
                })
                .catch(e => {
                   expect(e).toEqual(null)
                });
      })

it("não envia email caso não haja informações sobre a descrição da turma",() =>{
    var turma: Turma = new Turma();
    var options: any = { method: 'POST', uri:notUrl, body:  turma,json:true}
    return request.post(options).then(body=>
        expect(body).toEqual("Faltam informações da turma!"))
        .catch(e=> 
            expect(e).toEqual(null))
}
);
it("envia email normalmente",() =>{
    var turma: Turma = new Turma();
    turma.descricao = "32131";
    var options: any = { method: 'POST', uri:notUrl, body:  turma,json:true}
    return request.post(options).then(body=>
        expect(body).toEqual(turma))
        .catch(e=> 
            expect(e).toEqual(null))
}
);

    })
