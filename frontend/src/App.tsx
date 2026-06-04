import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

const CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const ABI = [
  { name: 'stake',    type: 'function', stateMutability: 'payable',    inputs: [],                                     outputs: [] },
  { name: 'unstake',  type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'claim',    type: 'function', stateMutability: 'nonpayable', inputs: [],                                     outputs: [] },
  { name: 'staked',   type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'address' }],        outputs: [{ type: 'uint256' }] },
  { name: 'earned',   type: 'function', stateMutability: 'view',       inputs: [{ name: '', type: 'address' }],        outputs: [{ type: 'uint256' }] },
  { name: 'rewardBps',type: 'function', stateMutability: 'view',       inputs: [],                                     outputs: [{ type: 'uint256' }] },
] as const;

export default function App() {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [stakeAmt, setStakeAmt] = useState('');
  const [unstakeAmt, setUnstakeAmt] = useState('');

  const { data: stakedAmt } = useReadContract({ address: CONTRACT, abi: ABI, functionName: 'staked', args: [address ?? '0x0000000000000000000000000000000000000000'] });
  const { data: earnedAmt } = useReadContract({ address: CONTRACT, abi: ABI, functionName: 'earned', args: [address ?? '0x0000000000000000000000000000000000000000'] });
  const { data: bps }       = useReadContract({ address: CONTRACT, abi: ABI, functionName: 'rewardBps' });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui', padding: '2rem' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#f59e0b', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>CipherStake</h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>Stake USDC · Earn {bps ? Number(bps) / 100 : 1}% per day</p>
        </div>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><ConnectButton /></div>
        {isConnected && (
          <>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{stakedAmt ? formatEther(stakedAmt) : '0'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Staked USDC</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{earnedAmt ? formatEther(earnedAmt) : '0'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Earned USDC</div>
              </div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
              <input value={stakeAmt} onChange={e => setStakeAmt(e.target.value)} placeholder="Amount to stake (USDC)"
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: 'none', background: '#334155', color: '#f1f5f9', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
              <button disabled={isPending || !stakeAmt} onClick={() => writeContract({ address: CONTRACT, abi: ABI, functionName: 'stake', value: parseEther(stakeAmt || '0') })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {isPending ? 'Staking…' : 'Stake USDC'}
              </button>
            </div>
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input value={unstakeAmt} onChange={e => setUnstakeAmt(e.target.value)} placeholder="Unstake amount"
                style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none', background: '#334155', color: '#f1f5f9' }} />
              <button disabled={isPending} onClick={() => writeContract({ address: CONTRACT, abi: ABI, functionName: 'unstake', args: [parseEther(unstakeAmt || '0')] })}
                style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Unstake</button>
              <button disabled={isPending} onClick={() => writeContract({ address: CONTRACT, abi: ABI, functionName: 'claim' })}
                style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Claim</button>
            </div>
          </>
        )}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', marginTop: '1.5rem' }}>Robinhood Testnet · USDC Native · <a href={`https://explorer.testnet.chain.robinhood.com/address/${CONTRACT}`} style={{ color: '#f59e0b' }} target="_blank">Contract ↗</a></p>
      </div>
    </div>
  );
}