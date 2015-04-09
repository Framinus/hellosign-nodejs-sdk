var expect = require('expect.js');
var params = require('../testparams.js');
var hellosign = require('../../lib/hellosign.js')({
	key: params.key,
	client_id: params.client_id,
	client_secret: params.client_secret,
	dev: params.dev || false
});
var fs = require('fs');

describe('Signature Request', function(){

   describe('Send a signature request', function(){
    
    it('should send a request', function(){

      var options = {
                      test_mode : 1,
                      title : 'NDA with Acme Co.',
                      subject : 'The NDA we talked about',
                      message : 'Please sign this NDA and then we can discuss more. Let me know if you have any questions.',
                      signers : [
                        {
                          email_address : 'jack@example.com',
                          name : 'Jack',
                          order : 0,
                        },
                        {
                          email_address : 'jill@example.com',
                          name : 'Jill',
                          order : 1,
                        }
                      ],
                      cc_email_addresses : ['lawyer@example.com', 'lawyer2@example.com'],
                      files : ['test/functional/docs/nda.pdf'],
                      metadata : {
                        clientId : '1234',
                        custom_text : 'NDA #9'
                      }
                    }

      var result = hellosign.signatureRequest.send(options)
                        .then(function(res){
                          expect(res.signature_request).to.be.ok();
                        });
      return result;
    });

    it('should send a request with a template', function(){
      var options = {
                       test_mode : 1,
                       template_id : 'TO_BE_POPULATED_BY_PROMISE_RESOLUTION',
                       subject : 'Purchase Order',
                       message : 'Glad we could come to an agreement.',
                       signers : [
                         {
                           email_address : 'george@example.com',
                           name : 'George',
                           role : 'Signer'
                         }
                       ]
                    };

      var result = hellosign.template.list()
                      .then(function(res){
                        options.template_id = res.templates[0].template_id;
                        return hellosign.signatureRequest.sendWithTemplate(options);
                      })
                      .then(function(res){
                        expect(res.signature_request).to.be.ok();
                      });

      return result;
    });

  describe('Listing exisitng requests', function(){
  	it('should list current signature requests', function(){
  		var result = hellosign.signatureRequest.list()
                      .then(function(res){
                        expect(res.signature_requests).to.be.ok();
                      });
  		return result;
  	});
  });

  describe('Get an existing request', function(){
    it('should get a current signature request', function(){
      var result = hellosign.signatureRequest.list()
                      .then(function(res){
                        return hellosign.signatureRequest.get(res.signature_requests[0].signature_request_id);
                      })
                      .then(function(res){
                        expect(res.signature_request).to.be.ok();
                      });
      return result;
    });
  });

 
  });

  describe('Actions on signature requests', function(){
    
    it('should send a signature request reminder', function(){
      var result = hellosign.signatureRequest.list()
                    .then(function(res){
                      var req_id = res.signature_requests[0].signature_request_id;
                      var email = res.signature_requests[0].signatures[0].signer_email_address;
                      return hellosign.signatureRequest.remind(req_id,{email_address : email});
                    })
                    .then(function(res){
                      expect(res.signature_request).to.be.ok();
                    });
      return result;

    });

    it('should download from a request', function(done){

      if(fs.existsSync("files.zip")){
        fs.unlinkSync("files.zip");
      }

      hellosign.signatureRequest.list(function(err, success){
        var req_id = success.signature_requests[0].signature_request_id;
        hellosign.signatureRequest.download(req_id, {file_type: 'zip'}, function(err, response){
          if(err){
            return done(err);
          }
          var file = fs.createWriteStream("files.zip");
          response.pipe(file);
          file.on('finish', function() {
            file.close();
            // if we can close the filestream, we were successful; call done()
            done();
          });
        });  
      });


    });

    it('should cancel an existing request', function(){
      hellosign.signatureRequest.list()
            .then(function(res){
              var req_id = res.signature_requests[0].signature_request_id;
              // No return - should simply run without error
              hellosign.signatureRequest.cancel(req_id);
            });
    });
  });

  describe('Embedded requests', function(){
    it('should send an embedded request', function(){
      
      var options = {
                      test_mode : 1,
                      clientId : params.client_id,
                      title : 'NDA with Acme Co.',
                      subject : 'The NDA we talked about',
                      message : 'Please sign this NDA and then we can discuss more. Let me know if you have any questions.',
                      signers : [
                        {
                          email_address : 'jack@example.com',
                          name : 'Jack',
                          order : 0,
                        },{
                          email_address : 'jill@example.com',
                          name : 'Jill',
                          order : 1,
                        }
                      ],
                      cc_email_addresses : ['lawyer@example.com', 'lawyer@example2.com'],
                      files : ['test/functional/docs/nda.pdf']
                    }

      var result = hellosign.signatureRequest.createEmbedded(options)
                      .then(function(res){
                        expect(res.signature_request).to.be.ok();
                      });
      return result;

    });
    it('should send an embedded request with a template', function(){
      var options = {
                     test_mode : 1,
                     clientId : params.client_id,
                     template_id : 'TO_BE_POPULATED_BY_PROMISE_RESOLUTION',
                     subject : 'Purchase Order',
                     message : 'Glad we could come to an agreement.',
                     signers : [
                       {
                         email_address : 'george@example.com',
                         name : 'George',
                         role : 'Signer'
                       }
                     ]
                    };

      var result = hellosign.template.list()
                    .then(function(res){
                      options.template_id = res.templates[0].template_id;
                      return hellosign.signatureRequest.createEmbeddedWithTemplate(options);
                    })
                    .then(function(res){
                      expect(res.signature_request).to.be.ok();
                    });
      return result;
    });
  });

});