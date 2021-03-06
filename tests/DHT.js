// Generated by LiveScript 1.5.0
/**
 * @package   Detox transport
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright Copyright (c) 2017, Nazar Mokrynskyi
 * @license   MIT License, see license.txt
 */
(function(){
  var detoxCrypto, lib, test, bootstrap_ip, bootstrap_port;
  detoxCrypto = require('@detox/crypto');
  lib = require('..');
  test = require('tape');
  bootstrap_ip = '127.0.0.1';
  bootstrap_port = 16882;
  /**
   * @param {!Uint8Array} array
   *
   * @return {string}
   */
  function array2hex(array){
    var string, i$, len$, byte;
    string = '';
    for (i$ = 0, len$ = array.length; i$ < len$; ++i$) {
      byte = array[i$];
      string += byte.toString(16).padStart(2, '0');
    }
    return string;
  }
  /**
   * @param {string} string
   *
   * @return {!Uint8Array}
   */
  function hex2array(string){
    var array, i$, to$, i;
    array = new Uint8Array(string.length / 2);
    for (i$ = 0, to$ = array.length; i$ < to$; ++i$) {
      i = i$;
      array[i] = parseInt(string.substring(i * 2, i * 2 + 2), 16);
    }
    return array;
  }
  lib.ready(function(){
    test('DHT', function(t){
      var bootstrap_node_dht, node_1_dht, node_1_real, node_2_dht, node_3_dht, bootstrap_node_instance, bootstrap_node_info, node_1_instance, node_2_instance, node_3_instance, wait_for;
      t.plan(15);
      bootstrap_node_dht = detoxCrypto.create_keypair(hex2array('561401dff7921304e6c266639cc6a37a14c1600f9928dbf9afc99a61f0732d43'));
      node_1_dht = detoxCrypto.create_keypair(hex2array('4b39c9e51f2b644fd0678769cc53069e9c1a93984bbffd7f0fbca2375c08b815'));
      node_1_real = detoxCrypto.create_keypair(hex2array('cefed82d3c4e04af9c8ca516db37b48a09f602a7f11c565dc6707cfe2fa3373d'));
      node_2_dht = detoxCrypto.create_keypair(hex2array('910e5d834e32835d427ca4507c4a6a6c1715fd7cbd290cda8d4c1aa90d0f251d'));
      node_3_dht = detoxCrypto.create_keypair(hex2array('7be95d9a4aecf3d353a5a9264b0c76497d977393d2b549f3cec51837f3b528e0'));
      bootstrap_node_instance = lib.DHT(bootstrap_node_dht.ed25519['public'], bootstrap_node_dht.ed25519['private'], [], [], 1024, 5, 2);
      bootstrap_node_instance.start_bootstrap_node(bootstrap_ip, bootstrap_port);
      bootstrap_node_info = {
        node_id: array2hex(bootstrap_node_dht.ed25519['public']),
        host: bootstrap_ip,
        port: bootstrap_port
      };
      node_1_instance = lib.DHT(node_1_dht.ed25519['public'], node_1_dht.ed25519['private'], [bootstrap_node_info], [], 512, 5, 2);
      node_2_instance = lib.DHT(node_2_dht.ed25519['public'], node_2_dht.ed25519['private'], [bootstrap_node_info], [], 512, 5, 2);
      node_3_instance = lib.DHT(node_3_dht.ed25519['public'], node_3_dht.ed25519['private'], [bootstrap_node_info], [], 512, 5, 2);
      wait_for = 3;
      function ready(){
        --wait_for;
        if (!wait_for) {
          all_ready();
        }
      }
      node_1_instance.once('ready', ready);
      node_2_instance.once('ready', ready);
      node_3_instance.once('ready', ready);
      node_1_instance.once('node_connected', function(node_id){
        t.equal(array2hex(node_id), array2hex(bootstrap_node_dht.ed25519['public']), 'Connected to WebRTC (bootstrap) node #1');
      });
      node_2_instance.once('node_connected', function(node_id){
        t.equal(array2hex(node_id), array2hex(bootstrap_node_dht.ed25519['public']), 'Connected to WebRTC (bootstrap) node #2');
      });
      node_3_instance.once('node_connected', function(node_id){
        t.equal(array2hex(node_id), array2hex(bootstrap_node_dht.ed25519['public']), 'Connected to WebRTC (bootstrap) node #3');
      });
      function all_ready(){
        var introduction_nodes, introduction_message;
        t.pass('Nodes are ready');
        t.deepEqual(node_1_instance.get_bootstrap_nodes()[0], bootstrap_node_info, 'Bootstrap nodes are returned correctly #1');
        t.deepEqual(node_2_instance.get_bootstrap_nodes()[0], bootstrap_node_info, 'Bootstrap nodes are returned correctly #2');
        t.deepEqual(node_3_instance.get_bootstrap_nodes()[0], bootstrap_node_info, 'Bootstrap nodes are returned correctly #3');
        introduction_nodes = [detoxCrypto.create_keypair().ed25519['public'], detoxCrypto.create_keypair().ed25519['public']];
        introduction_message = node_1_instance.generate_introduction_message(node_1_real.ed25519['public'], node_1_real.ed25519['private'], introduction_nodes);
        node_1_instance._dht.on('put', function(){
          setTimeout(function(){
            node_3_instance.find_introduction_nodes(node_1_real.ed25519['public'], function(introduction_nodes_received){
              t.deepEqual(introduction_nodes_received, introduction_nodes, 'Introduction nodes found successfully');
              node_2_instance.once('node_tagged', function(id){
                t.equal(array2hex(id), array2hex(node_1_dht.ed25519['public']), 'Remote node tagged connection');
                node_2_instance.once('data', function(id, data){
                  t.equal(array2hex(id), array2hex(node_1_dht.ed25519['public']), 'Received data from correct source');
                  t.equal(array2hex(data), array2hex(node_1_real.ed25519['public']), 'Received correct data');
                  node_2_instance.once('node_untagged', function(id){
                    t.equal(array2hex(id), array2hex(node_1_dht.ed25519['public']), 'Remote node untagged connection');
                    node_1_instance.once('node_disconnected', function(){
                      t.pass('Disconnected from WebRTC node #1');
                    });
                    node_2_instance.once('node_disconnected', function(){
                      t.pass('Disconnected from WebRTC node #2');
                    });
                    node_3_instance.once('node_disconnected', function(){
                      t.pass('Disconnected from WebRTC node #3');
                    });
                    bootstrap_node_instance.destroy();
                    node_1_instance.destroy();
                    node_2_instance.destroy();
                    node_3_instance.destroy();
                  });
                  node_1_instance.del_used_tag(node_2_dht.ed25519['public']);
                });
                node_1_instance.send_data(node_2_dht.ed25519['public'], node_1_real.ed25519['public']);
              });
              node_1_instance.add_used_tag(node_2_dht.ed25519['public']);
            });
          });
        });
        return node_2_instance.publish_introduction_message(introduction_message);
      }
    });
  });
}).call(this);
