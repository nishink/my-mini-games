import assert from 'assert';

const tests = [
  './mapgen.test.js',
  './entity.test.js',
  './turnmanager.test.js'
];

async function run(){
  console.log('Running tests...');
  for(const t of tests){
    process.stdout.write(`- ${t} ... `);
    try{
      const mod = await import(t);
      if(typeof mod.runTests === 'function'){
        await mod.runTests({assert});
      }
      console.log('OK');
    }catch(err){
      console.log('FAILED');
      console.error(err);
      process.exitCode = 1;
      return;
    }
  }
  console.log('All tests passed.');
}

run();
