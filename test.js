const fs = require('fs');
const path = require('path');
const BSON = require('bson')
const msgpack = require('msgpack-lite');
const Benchmark = require('benchmark');
const thriftrw = require('thriftrw')
const protobuf = require('protobufjs');
const protobufPerson = protobuf.loadSync('Person.proto');
const Person = protobufPerson.lookupType('Person');
var thrift = new thriftrw.Thrift({
  source: fs.readFileSync(path.join(__dirname, 'Person.thrift'), 'utf8'),
  allowOptionalArguments: true,
});

const jsonData = {name: "John", age: 30};
const suite = new Benchmark.Suite()

let json_result,bson_result,msgpack_result,proto_result,thrift_result;
suite.add('JSON', ()=>{ json_result = JSON.stringify(jsonData)})
suite.add('BSON', ()=>{ bson_result = BSON.serialize(jsonData)})
suite.add('msgpack', ()=>{ msgpack_result = msgpack.encode(jsonData)})
suite.add('protobuf', ()=>{ proto_result = Person.encode(jsonData).finish()})
suite.add('thrift', ()=>{ thrift_result = thrift.Person.toBuffer(jsonData)})
suite.add('----------')
suite.add('JSON—de', ()=>{ JSON.parse(json_result)})
suite.add('BSON-de', ()=>{ BSON.deserialize(bson_result)})
suite.add('msgpack-de', ()=>{ msgpack.decode(msgpack_result)})
suite.add('protobuf-de', ()=>{ Person.decode(proto_result)})
suite.add('thrift-de', ()=>{ thrift.Person.fromBuffer(thrift_result)})

suite.on('cycle', (event) => console.log(String(event.target)))
suite.on('complete', function() {console.log('Fastest is ' + this.filter('fastest').map('name'))})
suite.run()