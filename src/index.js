// Generated by LiveScript 1.5.0
/**
 * @package   Detox transport
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  function Transport(webtorrentDht, ronion, jssha){
    /**
     * @param {!Uint8Array} data
     *
     * @return {string}
     */
    function sha3_256(data){
      var shaObj;
      shaObj = new jsSHA('SHA3-256', 'ARRAYBUFFER');
      shaObj.update(array);
      return shaObj.getHash('HEX');
    }
    /**
     * @constructor
     *
     * @param {!Uint8Array}	node_id
     * @param {!string[]}	bootstrap_nodes
     * @param {!Object[]}	ice_servers
     *
     * @return {DHT}
     */
    function DHT(node_id, bootstrap_nodes, ice_servers){
      if (!(this instanceof DHT)) {
        return new DHT(node_id, bootstrap_nodes, ice_servers);
      }
      this._dht = new DHT({
        nodeId: node_id,
        bootstrap_nodes: bootstrap_nodes,
        hash: sha3_256,
        simple_peer_opts: {
          config: {
            iceServers: ice_servers
          }
        }
      });
    }
    DHT.prototype = {
      /**
       * Start WebSocket server listening on specified ip:port, so that current node will be capable of acting as bootstrap node for other users
       *
       * @param {number}	port
       * @param {string}	ip
       */
      start_bootstrap_node: function(port, ip){
        this._dht.listen(port, ip);
      }
      /**
       * @return {!string[]}
       */,
      get_bootstrap_nodes: function(){
        return this._dht.toJSON().nodes;
      }
      /**
       * @param {Function} callback
       */,
      'destroy': function(callback){
        this._dht.destroy(callback);
        delete this._dht;
      }
    };
    Object.defineProperty(DHT.prototype, 'constructor', {
      enumerable: false,
      value: DHT
    });
    return {
      'DHT': DHT
    };
  }
  if (typeof define === 'function' && define['amd']) {
    define(['webtorrent-dht', 'ronion', 'jssha/src/sha3'], Transport);
  } else if (typeof exports === 'object') {
    module.exports = Transport(require('webtorrent-dht'), require('ronion'), require('jssha/src/sha3'));
  } else {
    this['detox_transport'] = Transport(this['webtorrent_dht'], this['ronion'], this['jsSHA']);
  }
}).call(this);