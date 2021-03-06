/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
import {bs58Decode, bs58Encode} from './helpers.js';
import {verificationFail, verificationSuccess} from './assertions.js';
import {credentials} from '../credentials/index.js';
import {filterByTag} from 'vc-api-test-suite-implementations';
import {klona} from 'klona';

const {
  issuedVc,
  canonizeJCS: incorrectCannonization,
  digestSha512: incorrectHash
} = credentials;
// only use implementations with `Ed25519 2020` verifiers.
const {match, nonMatch} = filterByTag({
  tags: ['Ed25519Signature2020'],
  property: 'verifiers'
});

describe('Ed25519Signature2020 (verify)', function() {
  describe('Data Integrity (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];
    for(const [name, implementation] of match) {
      describe(name, function() {
      // wrap the testApi config in an Implementation class
        const verifier = implementation.verifiers.find(verifier =>
          verifier.tags.has('Ed25519Signature2020'));
        it('If the "proof" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof;
          await verificationFail({credential, verifier});
        });
        it('If the "type" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof.type;
          await verificationFail({credential, verifier});
        });
        it('If the "created" field is missing or invalid, a MALFORMED error ' +
          'MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof.created;
          await verificationFail({credential, verifier});
        });
        it('If the "verificationMethod" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof.verificationMethod;
          await verificationFail({credential, verifier});
        });
        it('If the "proofPurpose" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof.proofPurpose;
          await verificationFail({credential, verifier});
        });
        it('If the "proofValue" field is missing or invalid, ' +
          'a MALFORMED error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          delete credential.proof.proofValue;
          await verificationFail({credential, verifier});
        });

      });
    }
  });
  describe('Ed25519Signature2020 (verifier)', function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [...match.keys()];
    this.notImplemented = [...nonMatch.keys()];

    for(const [name, implementation] of match) {
      describe(name, function() {
      // wrap the testApi config in an Implementation class
        const verifier = implementation.verifiers.find(verifier =>
          verifier.tags.has('Ed25519Signature2020'));
        it('MUST verify a valid VC with an Ed25519Signature2020 proof',
          async function() {
            this.test.cell = {
              columnId: name,
              rowId: this.test.title
            };
            const credential = klona(issuedVc);
            await verificationSuccess({credential, verifier});
          });
        it('If the "type" field is not the string "Ed25519Signature2020", an ' +
          'UNKNOWN_CRYPTOSUITE_TYPE error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          credential.proof.type = 'UnknownCryptoSuite';
          await verificationFail({credential, verifier});
        });
        it('If the "proofValue" field is not a multibase-encoded base58-btc ' +
          'value, an INVALID_PROOF_VALUE error MUST be returned.',
        async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          credential.proof.proofValue = 'not-multibase-bs58-encoded!!';
          await verificationFail({credential, verifier});
        });
        it('If the "proofValue" field, when decoded to raw bytes, is not ' +
          '64 bytes in length if the associated public key is 32 bytes ' +
          'in length, or 114 bytes in length if the public key is 57 bytes ' +
          'in length, an INVALID_PROOF_LENGTH error MUST be returned.',
        async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(issuedVc);
          const proofBytes = bs58Decode({id: credential.proof.proofValue});
          const randomBytes = new Uint8Array(32).map(
            () => Math.floor(Math.random() * 255));
          credential.proof.proofValue = bs58Encode(
            new Uint8Array([...proofBytes, ...randomBytes]));
          await verificationFail({credential, verifier});
        });
        it('If a canonicalization algorithm other than URDNA2015 is used, ' +
          'a INVALID_PROOF_VALUE error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(incorrectCannonization);
          await verificationFail({credential, verifier});
        });
        it('If a canonicalization data hashing algorithm SHA-2-256 is used, ' +
          'a INVALID_PROOF_VALUE error MUST be returned.', async function() {
          this.test.cell = {
            columnId: name,
            rowId: this.test.title
          };
          const credential = klona(incorrectHash);
          await verificationFail({credential, verifier});
        });
      });
    }
  });
  describe.skip('eddsa-2022 cryptosuite', function() {
    it('If the "type" field is not the string "DataIntegritySignature", ' +
      'a UNKNOWN_PROOF_TYPE error MUST be returned.');
    it('If the "cryptosuite" field is not the string "eddsa-2022", ' +
      'an UNKNOWN_CRYPTOSUITE_TYPE error MUST be returned.');
    it('If the "proofValue" field is not a multibase-encoded base58-btc ' +
      'value, an INVALID_PROOF_VALUE error MUST be returned.');
    it('If the "proofValue" field, when decoded to raw bytes, is not 64 ' +
      'bytes in length if the associated public key is 32 bytes in length, ' +
      'or 114 bytes in length if the public key is 57 bytes in length, ' +
      'an INVALID_PROOF_LENGTH error MUST be returned.');
    it('If a canonicalization algorithm other than URDNA2015 is used, ' +
      'a INVALID_PROOF_VALUE error MUST be returned.');
    it('If a canonicalization data hashing algorithm SHA-2-256 is used, ' +
      'a INVALID_PROOF_VALUE error MUST be returned.');
  });
});
