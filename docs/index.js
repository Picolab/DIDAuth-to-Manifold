async function main(){
  // start it up
  var pe = await PicoEngine();
  window.pe = pe;// make it global so we can use it in the devtools console

  // now you can use pe (instance of pico-engine-core)

  pe.emitter.on('klog',function(info,ctxt){
      console.log(
        '[KLOG]',
        info.message,
        info.val
      )
  })

  var rootECI = await pe.getRootECI()

  var ridWrangler = 'io.picolabs.wrangler'
  var agent_rbase = 'https://raw.githubusercontent.com/Picolab/G2S/master/krl/';
  var agent_rids = [
    'html',
    'webfinger',
    'org.sovrin.agent.ui',
    'org.sovrin.agent_message',
    'org.sovrin.agent',
    'org.sovrin.edge',
    'org.sovrin.lets_connect',
  ];
  var regRids = await pe.runQuery({eci:rootECI,rid:ridWrangler,name:'registeredRulesets'})
  for ( var i=0; i<agent_rids.length; ++i ){
    if (regRids.includes(agent_rids[i])) {
    } else {
      console.log('register: ',agent_rids[i]);
      await pe.registerRulesetURL(agent_rbase+agent_rids[i]+'.krl');
    }
  }

  console.log('started');

  var agentECI = null
  var children = await pe.runQuery({
    eci: rootECI,
    rid: ridWrangler,
    name: "children"
  })
  if(children && children.length){
    agentECI = children[0].eci
  } else {
    var agentLabel = "Manifold SSI"
    var directives = await pe.signalEvent({
      eci: rootECI,
      domain: "wrangler",
      type: "child_creation",
      attrs: {name:agentLabel,rids:"org.sovrin.agent;org.sovrin.lets_connect"}
    })
    var dirs = directives.directives
    if(dirs
      && dirs.length
      && dirs[0].name === 'Pico_Created'
      && dirs[0].options
      && dirs[0].options.pico
      && dirs[0].options.pico.eci)
    {
      agentECI = dirs[0].options.pico.eci
      await pe.signalEvent({
        eci: agentECI,
        eid: "make-edge-agent",
        domain: "wrangler",
        type: "install_rulesets_requested",
        attrs: {
            host: "https://manifold.picolabs.io:9090",
            eci: "WKZ1mTV72J9voNH8cAi2rW",
            label: "Manifold SSI Router",
            rids: "org.sovrin.edge"
        }
      })
    } else {
      alert('failure')
    }
  }
  var myself = await pe.runQuery({
    eci: agentECI,
    rid: 'io.picolabs.wrangler',
    name: 'myself'
  })

  document.title = myself.name + ' Agent'
  console.log('myself:', JSON.stringify(myself));
  $('#refresh').click(function (e) {
    e.preventDefault()
    doDisplay()
  })
  var agentTemplate = Handlebars.compile($('#agent-template').html());
  var ridAgent = 'org.sovrin.agent'
  var ridEdge = 'org.sovrin.edge'
  var eventRE = /^\/sky\/event\/([^\/]*)\/([^\/]*)\/([^\/]*)\/([^\/]*)/
  //var queryRE = /^\/sky\/query\/([^\/]*)\/([^\/]*)\/([^\/]*)/
  var formToJSON = function (form,qs) {
    var json = {}
    if(form){
      $.each($(form).serializeArray(), function (key, elm) {
        json[elm.name] = elm.value
      })
    }
    if(qs){
      var args = qs.split('&')
      for(var i=0; i<args.length; ++i){
        kv = args[i].split('=')
        var name = kv.shift()
        var value = kv.length ? (kv.length>1 ? kv.join('=') : kv.shift()) : ''
        json[name] = value
      }
    }
    return json
  }
  var convert = function(url,form){
      var parts = url.split('?')
      var isEvent = parts[0].match(eventRE)
      //var isQuery = parts[0].match(queryRE)
      parts.shift()
      var qs = parts.length ? parts.join('?') : ''
      if(isEvent){
        return({
          eci:isEvent[1],
          eid:isEvent[2],
          domain:isEvent[3],
          type:isEvent[4],
          attrs:formToJSON(form,qs)
        })
      }
      //}else if(isQuery){
        //return({
          //eci:isQuery[1],
          //rid:isQuery[2],
          //name:isQuery[3],
          //args:formToJSON(null,qs)
        //})
      //}
  }
  var $theSection = $('#section')
  var doDisplay = async function(){
    var agentUI = {
      name: myself.name,
      eci: myself.eci,
      pico_id: myself.id,
      browser: true
    }
    var hasRids = await pe.runQuery({eci:agentECI,rid:ridWrangler,name:'installedRulesets'})
    var isAgent = hasRids.includes(ridAgent)
    await pe.signalEvent(
      {eci:agentECI,eid:'poll_router',domain:'edge',type:'poll_all_needed'})
    if(isAgent){
      agentUI.ui = await pe.runQuery({eci:agentECI,rid:ridAgent,name:'ui'})
      var isEdge = hasRids.includes(ridEdge)
      if(isEdge){
        agentUI.ui.routerUI = await pe.runQuery({eci:agentECI,rid:ridEdge,name:'ui'})
        // adjust ui with router information
        var routerUsedCount = 0
        if (agentUI.ui && agentUI.ui.routerUI) {
          if (agentUI.ui.routerUI.routerName && agentUI.ui.connections) {
            var toSuffix = " to " + agentUI.ui.name
            for (var ic=0; ic < agentUI.ui.connections.length; ++ic) {
              var rConnName = agentUI.ui.connections[ic].label + toSuffix
              if (agentUI.ui.routerUI.routerConnections && agentUI.ui.routerUI.routerConnections[rConnName]) {
                agentUI.ui.connections[ic].routerName = agentUI.ui.routerUI.routerName
                ++routerUsedCount
              }
            }
          }
          agentUI.ui.routerUI.unused = routerUsedCount == 0
        }
      }
      agentUI.text = JSON.stringify(agentUI.ui, undefined, 2)
    } else {
      agentUI.disabled = true
    }
    $theSection.html(agentTemplate(agentUI))
    $theSection.trigger('handlebars:done')
    $theSection.find('.js-ajax-link').click(async function (e) {
      e.preventDefault()
      var href = $(this).attr('href')
      await pe.signalEvent(convert(href))
      doDisplay()
    })
    $theSection.find('.js-ajax-form').submit(async function (e) {
      e.preventDefault()
      var action = $(this).attr('action')
      await pe.signalEvent(convert(action,this))
      doDisplay()
    })
  }
  doDisplay()
}
main().catch(console.error)
