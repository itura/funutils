
module.exports = {
  then: f => p => p.then(f),
  catch: f => p => p.catch(f),
  finally: f => p => p.finally(f)
}
