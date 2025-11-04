import olxLogo from '../assets/olx-logo.png'

function Header() {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="mx-auto px-4 flex items-center justify-between">
        <img src={olxLogo} alt="OLX" className="h-16 w-auto block" />
      </div>
    </header>
  )
}

export default Header


