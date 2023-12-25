const fs = require('fs');
const lz4 = require('lz4')
const path = require('path');
const BSON = require('bson')
const msgpack = require('msgpack-lite');
const Benchmark = require('benchmark');
const thriftrw = require('thriftrw')
const dimbin = require('dimbin')
const protobuf = require('protobufjs');
const protobufPerson = protobuf.loadSync('Person.proto');
const Person = protobufPerson.lookupType('Person');
var thrift = new thriftrw.Thrift({
  source: fs.readFileSync(path.join(__dirname, 'Person.thrift'), 'utf8'),
  allowOptionalArguments: true,
});

let jsonData = {name: 
`Jodfjlakdjflkajdlkfja;`, age: 30};

//jsonData = JSON.parse(fs.readFileSync('test.json','utf-8').toString())
lz4.encode(JSON.stringify(jsonData))

let json_result,bson_result,msgpack_result,proto_result,thrift_result,dimbin_result,lz4_result;
console.log('----------serialize----------')
new Benchmark.Suite()
  .add('JSON', ()=>{ json_result = JSON.stringify(jsonData)})
  .add('BSON', ()=>{ bson_result = BSON.serialize(jsonData)})
  .add('msgpack', ()=>{ msgpack_result = msgpack.encode(jsonData)})
  .add('protobuf', ()=>{ proto_result = Person.encode(jsonData).finish()})
  .add('thrift', ()=>{ thrift_result = thrift.Person.toBuffer(jsonData)})
  .add('dimbin', ()=>{ dimbin_result = dimbin.serialize([dimbin.stringsSerialize(jsonData.name),new Uint32Array([30])])})
  .add('lz4', ()=>{ lz4_result = lz4.encode(json_result)})  //测试序列化和lz4压缩效率
  .on('cycle', (event) => console.log(String(event.target)))
  .on('complete', function() {console.log('Fastest is ' + this.filter('fastest').map('name'))})
  .run()
console.log('----------deserialize----------')
new Benchmark.Suite()
  .add('JSON—de', ()=>{ JSON.parse(json_result)})
  .add('BSON-de', ()=>{ BSON.deserialize(bson_result)})
  .add('msgpack-de', ()=>{ msgpack.decode(msgpack_result)})
  .add('protobuf-de', ()=>{ Person.decode(proto_result)})
  .add('thrift-de', ()=>{ thrift.Person.fromBuffer(thrift_result)})
  .add('dimbin-de', ()=>{ o=dimbin.parse(dimbin_result);dimbin.stringsParse(o[0])})
  .add('lz4-de', ()=>{ lz4.decode(lz4_result)})
  .on('cycle', (event) => console.log(String(event.target)))
  .on('complete', function() {console.log('Fastest is ' + this.filter('fastest').map('name'))})
  .run()
